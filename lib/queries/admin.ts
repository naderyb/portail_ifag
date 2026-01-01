import "server-only";
import { query } from "@/lib/db";

type AdminStats = {
  students_count: number;
  teachers_count: number;
  attendance_rate: number;
  announcements_this_month: number;
};

export async function getAdminDashboardStats(): Promise<AdminStats> {
  const [{ rows: s }, { rows: t }, { rows: a }, { rows: ann }] =
    await Promise.all([
      query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM students`),
      query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM teachers`),
      query<{ rate: number }>(
        `
      SELECT COALESCE(
        100 - (SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END)::decimal
              / GREATEST(COUNT(*),1) * 100), 100
      )::int AS rate
      FROM absences
      `
      ),
      query<{ cnt: number }>(
        `
      SELECT COUNT(*)::int AS cnt
      FROM announcements
      WHERE date_trunc('month', published_at) = date_trunc('month', now())
      `
      ),
    ]);

  return {
    students_count: s[0]?.cnt ?? 0,
    teachers_count: t[0]?.cnt ?? 0,
    attendance_rate: a[0]?.rate ?? 100,
    announcements_this_month: ann[0]?.cnt ?? 0,
  };
}
