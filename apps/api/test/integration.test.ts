import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { lessons } from '@lingua/core';
import { buildApp } from '../src/app';
test('API com PostgreSQL real', { skip: !process.env.TEST_DATABASE_URL }, async (t) => {
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new pg.Pool({
    connectionString: process.env.TEST_DATABASE_URL,
    options: `-c search_path=${schema}`,
  });
  const app = await buildApp(pool, async (token) => {
    if (token === 'fixture-user-a') return '00000000-0000-4000-8000-000000000001';
    if (token === 'fixture-user-b') return '00000000-0000-4000-8000-000000000002';
    throw new Error('Invalid test token');
  });
  const headers = { authorization: 'Bearer fixture-user-a' };
  const other = { authorization: 'Bearer fixture-user-b' };
  try {
    await pool.query(
      await readFile(new URL('../../../database/001_initial.sql', import.meta.url), 'utf8'),
    );
    for (const l of lessons) {
      await pool.query('INSERT INTO curriculum_weeks VALUES ($1,1,1,$2,$3)', [
        l.language,
        'Base',
        'Apresentar-se',
      ]);
      await pool.query(
        "INSERT INTO lessons (id,language_code,week,title,estimated_minutes,content,status) VALUES ($1,$2,1,$3,12,$4,'published')",
        [l.id, l.language, l.title, JSON.stringify(l)],
      );
    }
    await t.test('saúde consulta DB e catálogo contém os três pilotos', async () => {
      assert.equal((await app.inject('/health')).json().status, 'ok');
      assert.equal((await app.inject('/v1/catalog')).json().lessons.length, 3);
    });
    await t.test('sem token ou token inválido não acessa progresso', async () => {
      assert.equal((await app.inject('/v1/dashboard')).statusCode, 401);
      assert.equal(
        (await app.inject({ url: '/v1/dashboard', headers: { authorization: 'Bearer bad' } }))
          .statusCode,
        401,
      );
    });
    const session = {
      id: randomUUID(),
      language: 'ko',
      lessonId: 'ko-w1-intro',
      startedAt: '2026-01-01T12:00:00.000Z',
      endedAt: '2026-01-01T12:10:00.000Z',
      activeSeconds: 600,
      completed: true,
    };
    await t.test(
      'reenvio idempotente não duplica tempo/conclusão e não altera língua',
      async () => {
        assert.equal(
          (
            await app.inject({
              method: 'POST',
              url: '/v1/study-sessions',
              headers,
              payload: session,
            })
          ).statusCode,
          201,
        );
        assert.equal(
          (
            await app.inject({
              method: 'POST',
              url: '/v1/study-sessions',
              headers,
              payload: session,
            })
          ).json().duplicate,
          true,
        );
        assert.equal(
          (
            await app.inject({
              method: 'POST',
              url: '/v1/study-sessions',
              headers,
              payload: { ...session, activeSeconds: 300 },
            })
          ).statusCode,
          409,
        );
        const data = (await app.inject({ url: '/v1/dashboard', headers })).json();
        assert.equal(data.languages.find((l: any) => l.code === 'ko').seconds, 600);
        assert.equal(data.languages.find((l: any) => l.code === 'ko').completed, 1);
        assert.equal(data.languages.find((l: any) => l.code === 'fr').seconds, 0);
        const progress = await pool.query('SELECT attempts FROM lesson_progress');
        assert.equal(progress.rows[0].attempts, 1);
      },
    );
    await t.test('duração impossível, língua errada e body inválido são rejeitados', async () => {
      assert.equal(
        (
          await app.inject({
            method: 'POST',
            url: '/v1/study-sessions',
            headers,
            payload: { ...session, id: randomUUID(), activeSeconds: 601 },
          })
        ).statusCode,
        400,
      );
      assert.equal(
        (
          await app.inject({
            method: 'POST',
            url: '/v1/study-sessions',
            headers,
            payload: { ...session, id: randomUUID(), language: 'ja' },
          })
        ).statusCode,
        400,
      );
      assert.equal(
        (
          await app.inject({
            method: 'POST',
            url: '/v1/study-sessions',
            headers,
            payload: { ...session, userId: randomUUID() },
          })
        ).statusCode,
        400,
      );
    });
    const noteId = randomUUID();
    await t.test('notas ficam isoladas por idioma e usuário', async () => {
      assert.equal(
        (
          await app.inject({
            method: 'PUT',
            url: `/v1/notes/${noteId}`,
            headers,
            payload: { language: 'ko', body: 'Minha regra' },
          })
        ).statusCode,
        200,
      );
      assert.equal(
        (await app.inject({ url: '/v1/notes?language=fr', headers })).json().notes.length,
        0,
      );
      assert.equal(
        (await app.inject({ url: '/v1/notes?language=ko', headers: other })).json().notes.length,
        0,
      );
      assert.equal(
        (
          await app.inject({
            method: 'PUT',
            url: `/v1/notes/${noteId}`,
            headers: other,
            payload: { language: 'ko', body: 'Tentativa' },
          })
        ).statusCode,
        409,
      );
      assert.equal(
        (await app.inject({ method: 'DELETE', url: `/v1/notes/${noteId}`, headers: other }))
          .statusCode,
        204,
      );
      assert.equal(
        (await app.inject({ url: '/v1/notes?language=ko', headers })).json().notes[0].body,
        'Minha regra',
      );
      assert.equal(
        (await app.inject({ url: '/v1/dashboard', headers: other })).json().sessions.length,
        0,
      );
    });
    await t.test(
      'fuso do perfil é validado e IA permanece explicitamente indisponível',
      async () => {
        assert.equal(
          (
            await app.inject({
              method: 'PATCH',
              url: '/v1/profile',
              headers,
              payload: { timezone: 'invalid' },
            })
          ).statusCode,
          400,
        );
        assert.equal(
          (
            await app.inject({
              method: 'PATCH',
              url: '/v1/profile',
              headers,
              payload: { timezone: 'America/Sao_Paulo' },
            })
          ).json().timezone,
          'America/Sao_Paulo',
        );
        assert.equal(
          (await app.inject({ method: 'POST', url: '/v1/conversations', headers, payload: {} }))
            .statusCode,
          501,
        );
      },
    );
  } finally {
    await app.close();
    await pool.end();
    await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  }
});
