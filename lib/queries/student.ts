import "server-only";
import { query } from "@/lib/db";

type StudentRow = {
  promotion_name: string;
  id: number;
  full_name: string;
  avatar_url: string | null;
  class_id: number;
  group_id: number;
  speciality_id: number;
  class_name: string;
  group_name: string;
  speciality_name: string;
};

type ScheduleSlot = {
  day: string;
  start: string;
  end: string;
  subject: string;
  room: string | null;
  teacher: string;
};

type NotesSummary = {
  average: number;
  modules_count: number;
  best_module_name: string;
  best_module_grade: number;
  modules: {
    module_name: string;
    coefficient: number;
    grade: number;
  }[];
};

type AbsencesCount = {
  total: number;
  percentage: number; // pondéré entre TD et TP (cours exclus)
};

// New: detailed absence rows (adapt column names if your schema differs)
type Absence = {
  id: number;
  date: string; // DATE or TIMESTAMPTZ -> text via to_char if needed
  module_name: string | null;
  session_type: string | null;
  reason: string | null;
  justified: boolean;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  published_at: string;
};

type AcademicProgress = {
  percentage: number;
  level: number;
  label: string;
  current_semester_name: string;
  completed_credits: number;
  total_credits: number;
  remaining_weeks: number;
};

type HolidaysProgress = {
  percentage: number;
  days_until_next: number;
};

export async function getStudentDashboardData(studentId: number) {
  // 1) Student basic info from view v_student_profile (defined in your SQL)
  const studentRes = await query<StudentRow>(
    `
    SELECT
      id,
      full_name,
      avatar_url,
      class_id,
      group_id,
      speciality_id,
      class_name,
      group_name,
      speciality_name
    FROM v_student_profile
    WHERE id = $1
    LIMIT 1
    `,
    [studentId]
  );
  const student = studentRes.rows[0];
  if (!student) {
    throw new Error(`Student ${studentId} not found`);
  }

  // Use the same SQL logic as your working StudentSchedulePage, but parameterized
  const { rows: rawScheduleRows } = await query<ScheduleSlot>(
    `
    SELECT
      day,
      to_char(start_time, 'HH24:MI') AS start,
      to_char(end_time,   'HH24:MI') AS "end",
      subject,
      room,
      teacher
    FROM public.schedule
    WHERE lower(trim(class_name)) = lower(trim($1))
      AND lower(trim(group_name)) = lower(trim($2))
    ORDER BY day, start_time;
    `,
    [student.class_name, student.group_name]
  );

  // Same normalization as in your page component
  const schedule: ScheduleSlot[] = rawScheduleRows.map((s) => ({
    ...s,
    day: s.day.trim(),
    start: s.start.slice(0, 5),
  }));

  // 3) Notes summary (unchanged, just uses notes table)
  const notesRes = await query<{
    module_name: string;
    coefficient: number;
    grade: number | string;
  }>(
    `
    SELECT n.module_name,
           n.coefficient,
           n.grade
    FROM notes n
    WHERE n.student_id = $1
    `,
    [studentId]
  );

  // Normalize NUMERIC from PG (string) to number
  const modules = notesRes.rows.map((m) => ({
    ...m,
    grade: typeof m.grade === "string" ? parseFloat(m.grade) : m.grade ?? 0,
  }));

  const totalCoeff = modules.reduce((acc, m) => acc + (m.coefficient || 1), 0);

  const weighted =
    totalCoeff === 0
      ? 0
      : modules.reduce((acc, m) => acc + m.grade * (m.coefficient || 1), 0) /
        totalCoeff;

  const best =
    modules.length > 0
      ? modules.reduce((prev, cur) => (cur.grade > prev.grade ? cur : prev))
      : { module_name: "N/A", grade: 0, coefficient: 1 };

  const notesSummary = {
    average: isNaN(weighted) ? 0 : weighted,
    modules_count: modules.length,
    best_module_name: best.module_name,
    best_module_grade: best.grade,
    modules,
  };

  // 4) Absences
  // Total absences (toutes séances confondues : cours + TD + TP)
  const absRes = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM absences WHERE student_id = $1`,
    [studentId]
  );
  const rawAbs = absRes.rows[0] || { total: 0 };

  // Total absences TD (session_type commençant par 'TD')
  const tdAbsRes = await query<{ total: number }>(
    `
    SELECT COUNT(*)::int AS total
    FROM absences
    WHERE student_id = $1
      AND session_type ILIKE 'TD%'
    `,
    [studentId]
  );
  const rawTdAbs = tdAbsRes.rows[0] || { total: 0 };

  // Total absences TP (session_type commençant par 'TP')
  const tpAbsRes = await query<{ total: number }>(
    `
    SELECT COUNT(*)::int AS total
    FROM absences
    WHERE student_id = $1
      AND session_type ILIKE 'TP%'
    `,
    [studentId]
  );
  const rawTpAbs = tpAbsRes.rows[0] || { total: 0 };

  // Seuils max (à ajuster selon vos règles internes)
  const MAX_ALLOWED_TD_ABSENCES: number = 30;
  const MAX_ALLOWED_TP_ABSENCES: number = 30;

  const tdPercentage =
    MAX_ALLOWED_TD_ABSENCES === 0
      ? 0
      : Math.min(
          100,
          Math.round((rawTdAbs.total / MAX_ALLOWED_TD_ABSENCES) * 100)
        );

  const tpPercentage =
    MAX_ALLOWED_TP_ABSENCES === 0
      ? 0
      : Math.min(
          100,
          Math.round((rawTpAbs.total / MAX_ALLOWED_TP_ABSENCES) * 100)
        );

  // Pondération entre TD et TP (ici 50/50, à adapter si besoin)
  const TD_WEIGHT = 0.5;
  const TP_WEIGHT = 0.5;

  const percentage = Math.min(
    100,
    Math.round(TD_WEIGHT * tdPercentage + TP_WEIGHT * tpPercentage)
  );

  const absencesCount: AbsencesCount = {
    total: rawAbs.total,
    percentage, // basé uniquement sur TD/TP
  };

  // New: detailed absences history
  const absHistoryRes = await query<Absence>(
    `
    SELECT
      id,
      -- adapt column names if needed: date/absence_date/created_at...
      to_char(date, 'YYYY-MM-DD') AS date,
      module_name,
      session_type,
      reason,
      COALESCE(justified, false) AS justified
    FROM absences
    WHERE student_id = $1
    ORDER BY date DESC, id DESC
    `,
    [studentId]
  );
  const absencesHistory = absHistoryRes.rows;

  // 5) Announcements (global + targeted by class/speciality)
  const annRes = await query<Announcement>(
    `
    SELECT DISTINCT a.id, a.title, a.content, a.published_at
    FROM announcements a
    LEFT JOIN announcement_targets atg
      ON atg.announcement_id = a.id
    WHERE a.is_published = TRUE
      AND a.published_at <= now()
      AND (
        atg.id IS NULL
        OR atg.class_id = $1
        OR atg.speciality_id = $2
      )
    ORDER BY a.published_at DESC
    LIMIT 5
    `,
    [student.class_id, student.speciality_id]
  );
  const announcements = annRes.rows;

  // 6) Academic & holidays progress (still simplified; can later be derived from academic_calendar)
  const academicProgress = {
    percentage: 65,
    level: 2,
    label: "Année en bonne voie",
    current_semester_name: "Semestre 2",
    completed_credits: 36,
    total_credits: 60,
    remaining_weeks: 10,
  };

  const holidaysProgress = {
    percentage: 40,
    days_until_next: 18,
  };

  return {
    student,
    schedule,
    notesSummary,
    absencesCount,
    absencesHistory,
    announcements,
    academicProgress,
    holidaysProgress,
  };
}
