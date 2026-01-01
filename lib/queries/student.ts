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

  console.log("Student schedule lookup", {
    className: student.class_name,
    groupName: student.group_name,
  });

  // DEBUG: how many schedule rows does the app DB actually see?
  const { rows: scheduleCountRows } = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM public.schedule`
  );
  console.log("Schedule total rows in app DB", scheduleCountRows[0]?.count);

  // Fetch schedule rows for this class + group using the same DB helper
  const { rows: scheduleRows } = await query<ScheduleSlot>(
    `
    SELECT
      day,
      to_char(start_time, 'HH24:MI') AS start,
      to_char(end_time,   'HH24:MI') AS "end",
      subject,
      room,
      teacher
    FROM public.schedule
    WHERE class_name = $1
      AND group_name = $2
    ORDER BY day, start_time;
    `,
    [student.class_name, student.group_name]
  );
  console.log("Class+group schedule rowCount", scheduleRows.length);

  const schedule: ScheduleSlot[] = scheduleRows;

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
  const absRes = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM absences WHERE student_id = $1`,
    [studentId]
  );
  const absencesCount = absRes.rows[0] || { total: 0 };

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
    announcements,
    academicProgress,
    holidaysProgress,
  };
}
