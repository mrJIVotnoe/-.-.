import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
}

let dbClient: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (dbClient) return dbClient;

  const connectionString = process.env.DATABASE_URL;
  const sqlHost = process.env.SQL_HOST;

  if (connectionString || (sqlHost && process.env.SQL_USER)) {
    try {
      if (!global._postgresPool) {
        if (connectionString) {
          global._postgresPool = new Pool({
            connectionString,
            max: 10,
            connectionTimeoutMillis: 5000,
          });
        } else {
          global._postgresPool = new Pool({
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB_NAME || 'jiv_fleet',
            max: 10,
            connectionTimeoutMillis: 5000,
          });
        }

        global._postgresPool.on('error', (err) => {
          console.error('PostgreSQL Pool Error:', err);
        });
      }

      dbClient = drizzle(global._postgresPool, { schema });
      console.log('✅ Connected to PostgreSQL database via Drizzle ORM');
      return dbClient;
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection failed:', err);
    }
  }

  return null;
}

export { schema };
