export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const day = searchParams.get("day"); // e.g. "Lundi"
    const className = searchParams.get("className"); // e.g. "L1 Info"
    const groupName = searchParams.get("groupName"); // e.g. "G1"

    const conditions: string[] = [];
    const values: string[] = [];

    if (day) {
      values.push(day);
      conditions.push(`day = $${values.length}`);
    }
    if (className) {
      values.push(className);
      conditions.push(`class_name = $${values.length}`);
    }
    if (groupName) {
      values.push(groupName);
      conditions.push(`group_name = $${values.length}`);
    }

    let text = "SELECT * FROM public.schedule";
    if (conditions.length > 0) {
      text += " WHERE " + conditions.join(" AND ");
    }
    text += " ORDER BY day, start_time";

    const { rows } = await pool.query({ text, values });

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[GET /api/schedule]", error);
    return NextResponse.json(
      { error: "Unable to fetch schedule" },
      { status: 500 },
    );
  }
}
