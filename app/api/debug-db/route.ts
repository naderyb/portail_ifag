import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // uncomment if needed for Neon
});

export async function GET() {
  try {
    // Simple connectivity check
    const result = await pool.query("SELECT 1 AS ok");

    return NextResponse.json({
      status: "ok",
      db: result.rows[0],
    });
  } catch (error) {
    console.error("[GET /api/debug-db]", error);
    return NextResponse.json(
      { status: "error", message: "DB check failed" },
      { status: 500 },
    );
  }
}
