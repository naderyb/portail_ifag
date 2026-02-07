import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // uncomment if needed for Neon
});

// Avoid hitting the database during the production build/export phase
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export async function GET() {
  if (isBuildPhase) {
    return NextResponse.json({
      status: "skipped",
      reason: "DB check disabled during build phase",
    });
  }

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
