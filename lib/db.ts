import "server-only";
import { Pool, QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getDbPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.NEON_DATABASE_URL ||
      "postgres://user:password@localhost:5432/ifag";

    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    pool.on("error", (err) => {
      console.error("Unexpected PG error", err);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<{ rows: T[] }> {
  const client = getDbPool();
  return client.query<T>(text, params);
}
