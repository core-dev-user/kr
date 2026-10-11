import pg from 'pg';
import { buildApp } from './app';
import { createVerifier } from './auth';
if (!process.env.DATABASE_URL)
  throw new Error('Configure DATABASE_URL e execute npm run db:migrate.');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
const app = await buildApp(pool, createVerifier(), true);
await app.listen({ port: Number(process.env.PORT ?? 3001), host: process.env.HOST ?? '127.0.0.1' });
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, async () => {
    await app.close();
    await pool.end();
  });
