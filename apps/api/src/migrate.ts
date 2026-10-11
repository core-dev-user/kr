import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { lessons, languages, roadmap } from '@lingua/core';
if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  const sql = await readFile(
    fileURLToPath(new URL('../../../database/001_initial.sql', import.meta.url)),
    'utf8',
  );
  const checksum = createHash('sha256').update(sql).digest('hex');
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(617402)');
  await client.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  const previous = await client.query('SELECT checksum FROM schema_migrations WHERE id=$1', [
    '001_initial',
  ]);
  if (previous.rowCount && previous.rows[0].checksum !== checksum)
    throw new Error('Migration já aplicada foi alterada; crie uma nova migration.');
  if (!previous.rowCount) {
    await client.query(sql);
    for (const language of languages) {
      for (let week = 1; week <= 26; week++) {
        const month = Math.min(6, Math.ceil(week / 4));
        const item = roadmap[month - 1];
        await client.query('INSERT INTO curriculum_weeks VALUES ($1,$2,$3,$4,$5)', [
          language,
          week,
          month,
          item.title,
          item.goal,
        ]);
      }
    }
    for (const lesson of lessons) {
      await client.query(
        "INSERT INTO lessons (id,language_code,week,title,estimated_minutes,content,status) VALUES ($1,$2,$3,$4,$5,$6,'published')",
        [
          lesson.id,
          lesson.language,
          lesson.week,
          lesson.title,
          lesson.minutes,
          JSON.stringify(lesson),
        ],
      );
    }
    await client.query('INSERT INTO schema_migrations (id,checksum) VALUES ($1,$2)', [
      '001_initial',
      checksum,
    ]);
  }
  await client.query('COMMIT');
  console.log(
    previous.rowCount
      ? 'Schema atual; nenhuma alteração.'
      : 'Schema criado; 3 lições piloto e 78 semanas de planejamento.',
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
