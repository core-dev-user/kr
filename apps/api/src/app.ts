import Fastify, { type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import type pg from 'pg';
import { z } from 'zod';
import { languages, metrics, type StudySession } from '@lingua/core';
import type { VerifyToken } from './auth';
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}
const language = z.enum(['ko', 'ja', 'fr']);
const idParams = z.object({ id: z.uuid() });
const sessionInput = z
  .object({
    id: z.uuid(),
    language,
    lessonId: z.string().min(1).max(100),
    startedAt: z.iso.datetime(),
    endedAt: z.iso.datetime(),
    activeSeconds: z.number().int().min(1).max(21600),
    completed: z.boolean(),
  })
  .strict()
  .superRefine((s, ctx) => {
    const start = Date.parse(s.startedAt),
      end = Date.parse(s.endedAt);
    if (
      end < start ||
      s.activeSeconds > Math.ceil((end - start) / 1000) ||
      end > Date.now() + 120000
    )
      ctx.addIssue({ code: 'custom', message: 'Intervalo de estudo inválido' });
  });
const mapSession = (s: Record<string, any>): StudySession => ({
  id: s.id,
  language: s.language_code,
  lessonId: s.lesson_id,
  startedAt: new Date(s.started_at).toISOString(),
  endedAt: new Date(s.ended_at).toISOString(),
  activeSeconds: s.active_seconds,
  completed: s.completed,
});
export async function buildApp(pool: pg.Pool, verify: VerifyToken, logger = false) {
  const app = Fastify({ logger, bodyLimit: 128 * 1024 });
  app.decorateRequest('userId', '');
  await app.register(cors, {
    origin: process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? [],
  });
  await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError)
      return reply
        .code(400)
        .send({
          error: 'validation',
          details: error.issues.map((i) => ({ path: i.path, message: i.message })),
        });
    const failure = error as { code?: string; statusCode?: number };
    if (failure.code === '23503') return reply.code(400).send({ error: 'invalid_reference' });
    if (failure.statusCode && failure.statusCode < 500)
      return reply.code(failure.statusCode).send({ error: 'request_rejected' });
    request.log.error(error);
    return reply.code(500).send({ error: 'internal_error' });
  });
  app.get('/health', async () => {
    await pool.query('SELECT 1');
    return { status: 'ok' };
  });
  app.get('/v1/catalog', async () => {
    const { rows } = await pool.query(
      "SELECT content FROM lessons WHERE status='published' ORDER BY language_code,week,id",
    );
    return { lessons: rows.map((r) => r.content), pilot: true };
  });
  await app.register(async (privateApp) => {
    privateApp.addHook('preHandler', async (request, reply) => {
      const token = request.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
      if (!token) return reply.code(401).send({ error: 'unauthorized' });
      try {
        request.userId = z.uuid().parse(await verify(token));
      } catch {
        return reply.code(401).send({ error: 'unauthorized' });
      }
      await pool.query('INSERT INTO users (id) VALUES ($1) ON CONFLICT DO NOTHING', [
        request.userId,
      ]);
      await pool.query(
        'INSERT INTO user_languages (user_id,language_code) SELECT $1,code FROM languages ON CONFLICT DO NOTHING',
        [request.userId],
      );
    });
    privateApp.patch('/v1/profile', async (request, reply) => {
      const body = z
        .object({ timezone: z.string().min(1).max(80) })
        .strict()
        .parse(request.body);
      // PostgreSQL e Intl devem reconhecer o fuso, nunca usar offsets fixos.
      try {
        new Intl.DateTimeFormat('en', { timeZone: body.timezone });
      } catch {
        return reply.code(400).send({ error: 'invalid_timezone' });
      }
      const valid = await pool.query('SELECT name FROM pg_timezone_names WHERE name=$1', [
        body.timezone,
      ]);
      if (!valid.rowCount) return reply.code(400).send({ error: 'invalid_timezone' });
      await pool.query('UPDATE users SET timezone=$1 WHERE id=$2', [body.timezone, request.userId]);
      return { timezone: body.timezone };
    });
    privateApp.get('/v1/dashboard', async (request) => {
      const user = await pool.query('SELECT timezone FROM users WHERE id=$1', [request.userId]);
      const sessionRows = await pool.query(
        'SELECT * FROM study_sessions WHERE user_id=$1 ORDER BY ended_at',
        [request.userId],
      );
      const profiles = await pool.query(
        'SELECT language_code,proficiency,assessed_at,daily_goal_minutes FROM user_languages WHERE user_id=$1',
        [request.userId],
      );
      const sessions = sessionRows.rows.map(mapSession);
      return {
        timezone: user.rows[0].timezone,
        languages: languages.map((code) => ({
          code,
          ...metrics(sessions, code, new Date(), user.rows[0].timezone),
          ...profiles.rows.find((p) => p.language_code === code),
        })),
        sessions,
      };
    });
    privateApp.post('/v1/study-sessions', async (request, reply) => {
      const s = sessionInput.parse(request.body),
        client = await pool.connect();
      try {
        await client.query('BEGIN');
        const published = await client.query(
          "SELECT 1 FROM lessons WHERE id=$1 AND language_code=$2 AND status='published'",
          [s.lessonId, s.language],
        );
        if (!published.rowCount) {
          await client.query('ROLLBACK');
          return reply.code(400).send({ error: 'invalid_lesson' });
        }
        const inserted = await client.query(
          'INSERT INTO study_sessions (id,user_id,language_code,lesson_id,started_at,ended_at,active_seconds,completed) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING RETURNING id',
          [
            s.id,
            request.userId,
            s.language,
            s.lessonId,
            s.startedAt,
            s.endedAt,
            s.activeSeconds,
            s.completed,
          ],
        );
        if (!inserted.rowCount) {
          const existing = await client.query(
            'SELECT * FROM study_sessions WHERE id=$1 AND user_id=$2',
            [s.id, request.userId],
          );
          const record = existing.rows[0] && mapSession(existing.rows[0]);
          const same =
            record &&
            record.language === s.language &&
            record.lessonId === s.lessonId &&
            record.startedAt === new Date(s.startedAt).toISOString() &&
            record.endedAt === new Date(s.endedAt).toISOString() &&
            record.activeSeconds === s.activeSeconds &&
            record.completed === s.completed;
          await client.query('ROLLBACK');
          return same
            ? { id: s.id, duplicate: true }
            : reply.code(409).send({ error: 'session_conflict' });
        }
        if (s.completed)
          await client.query(
            'INSERT INTO lesson_progress (user_id,language_code,lesson_id,completed_at) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id,lesson_id) DO UPDATE SET attempts=lesson_progress.attempts+1',
            [request.userId, s.language, s.lessonId, s.endedAt],
          );
        await client.query('COMMIT');
        return reply.code(201).send({ id: s.id, duplicate: false });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    });
    privateApp.get('/v1/notes', async (request) => {
      const query = z.object({ language }).parse(request.query);
      const { rows } = await pool.query(
        'SELECT id,language_code AS language,body,updated_at AS "updatedAt" FROM notes WHERE user_id=$1 AND language_code=$2 ORDER BY updated_at DESC',
        [request.userId, query.language],
      );
      return { notes: rows };
    });
    privateApp.put('/v1/notes/:id', async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const body = z
        .object({ language, body: z.string().trim().min(1).max(20000) })
        .strict()
        .parse(request.body);
      const { rows } = await pool.query(
        'INSERT INTO notes (id,user_id,language_code,body) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET body=EXCLUDED.body,updated_at=now() WHERE notes.user_id=EXCLUDED.user_id AND notes.language_code=EXCLUDED.language_code RETURNING id,language_code AS language,body,updated_at AS "updatedAt"',
        [id, request.userId, body.language, body.body],
      );
      return rows[0] ?? reply.code(409).send({ error: 'note_conflict' });
    });
    privateApp.delete('/v1/notes/:id', async (request, reply) => {
      const { id } = idParams.parse(request.params);
      await pool.query('DELETE FROM notes WHERE id=$1 AND user_id=$2', [id, request.userId]);
      return reply.code(204).send();
    });
    privateApp.post('/v1/conversations', async (_request, reply) =>
      reply
        .code(501)
        .send({
          error: 'provider_not_configured',
          message:
            'Integração STT/LLM/TTS requer provedor e consentimento; nenhum áudio é enviado nesta versão.',
        }),
    );
  });
  return app;
}
