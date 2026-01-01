export const runtime = "nodejs";

import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { getStudentDashboardData } from "@/lib/queries/student";
import Link from "next/link";

const daysOrder = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];

// Créneaux fixes de l'école
const timeRanges = [
  "08:30 - 10:30",
  "10:45 - 12:30",
  "13:30 - 15:30",
  "15:45 - 17:30",
];

const getCellColorClasses = (subject: string) => {
  const lower = subject.toLowerCase();
  if (lower.startsWith("tp")) {
    // TP → bleu comme sur l'exemple
    return "bg-sky-500/20 border-sky-400/50";
  }
  if (
    lower.includes("cours") ||
    lower.includes("dev") ||
    lower.includes("gestion")
  ) {
    // Cours magistral → vert
    return "bg-emerald-500/20 border-emerald-400/50";
  }
  // Autre
  return "bg-slate-700/40 border-slate-600/60";
};

async function StudentSchedulePage() {
  // Idéalement, récupéré depuis l'auth
  const studentId = 1;
  const data = await getStudentDashboardData(studentId);

  const { student, schedule } = data;

  const matrix: Record<string, Record<string, typeof schedule>> = {};
  schedule.forEach((slot) => {
    const range = `${slot.start} - ${slot.end}`;
    if (!timeRanges.includes(range)) return; // ignore non-standard créneaux
    if (!matrix[slot.day]) matrix[slot.day] = {};
    if (!matrix[slot.day][range]) matrix[slot.day][range] = [];
    matrix[slot.day][range].push(slot);
  });

  const studentNav = [
    { label: "Tableau de bord", href: "/student" },
    { label: "Notes", href: "/student/notes" },
    { label: "Emploi du temps", href: "/student/schedule" },
    { label: "Absences", href: "/student/absences" },
    { label: "Profil", href: "/student/profile" },
  ];

  return (
    <Shell
      title="Emploi du temps"
      subtitle={`Semaine de ${student.full_name} • ${student.class_name} • Groupe ${student.group_name}`}
      variant="student"
    >
      <div className="space-y-4">
        {/* Mobile nav */}
        <div className="md:hidden">
          <Card>
            <details className="text-xs text-slate-200">
              <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Menu étudiant
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {studentNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-100 hover:border-sky-500 hover:text-sky-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </Card>
        </div>

        <div className="flex gap-4">
          {/* Desktop sidebar */}
          <aside className="hidden w-52 shrink-0 md:block">
            <Card>
              <nav className="flex flex-col gap-2 text-xs">
                {studentNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-100 hover:border-sky-500 hover:text-sky-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-6">
            <Card>
              <div className="flex flex-col gap-2 text-xs text-slate-300 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Emploi du Temps • {student.class_name} • Groupe{" "}
                    {student.group_name}
                  </p>
                  <p className="mt-1">
                    Spécialité : {student.speciality_name} • Promotion{" "}
                    {student.promotion_name ?? ""}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 md:mt-0">
                  <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200">
                    Les créneaux d&apos;aujourd&apos;hui sont mis en avant dans le
                    planning.
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Planning détaillé de la semaine">
              {schedule.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Aucun créneau n&apos;est planifié pour le moment.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-[11px]">
                    <thead>
                      <tr>
                        <th className="w-32 border border-slate-700 bg-slate-900/80 px-2 py-2 text-left font-semibold text-slate-100">
                          Date / Jour
                        </th>
                        {timeRanges.map((range) => (
                          <th
                            key={range}
                            className="border border-slate-700 bg-slate-900/80 px-2 py-2 font-semibold text-slate-100"
                          >
                            {range}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {daysOrder.map((day) => {
                        const daySlots = matrix[day] || {};
                        const isToday = new Date()
                          .toLocaleDateString("fr-DZ", { weekday: "long" })
                          .toLowerCase()
                          .startsWith(day.toLowerCase().slice(0, 3));

                        return (
                          <tr key={day}>
                            <td
                              className={`border border-slate-700 px-2 py-3 align-top text-xs ${
                                isToday
                                  ? "bg-slate-900/90 font-semibold text-sky-200"
                                  : "bg-slate-900/60 text-slate-200"
                              }`}
                            >
                              <div>{day}</div>
                              {/* Vous pouvez afficher ici une vraie date si vous la stockez */}
                            </td>
                            {timeRanges.map((range) => {
                              const cellSlots = daySlots[range] ?? [];
                              return (
                                <td
                                  key={range}
                                  className="min-w-[140px] border border-slate-700 bg-slate-900/40 px-2 py-2 align-top"
                                >
                                  {cellSlots.length === 0 ? (
                                    <div className="h-12 rounded-md bg-slate-900/40" />
                                  ) : (
                                    <div className="space-y-1">
                                      {cellSlots.map((slot, idx) => (
                                        <div
                                          key={`${slot.subject}-${idx}`}
                                          className={`rounded-md border px-1.5 py-1 ${getCellColorClasses(
                                            slot.subject
                                          )}`}
                                        >
                                          <div className="font-semibold text-[11px] text-slate-50">
                                            {slot.subject}
                                          </div>
                                          <div className="text-[10px] text-slate-100/90">
                                            {slot.teacher}
                                          </div>
                                          <div className="mt-0.5 text-[10px] text-slate-100/80">
                                            Salle {slot.room}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-3 text-[10px] italic text-slate-500">
                Le présent programme peut subir des modifications ou des changements
                en fonction de la disponibilité des enseignants.
              </p>
            </Card>
          </main>
        </div>
      </div>
    </Shell>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-6 text-slate-200">
          Chargement de l&apos;emploi du temps...
        </div>
      }
    >
      <StudentSchedulePage />
    </Suspense>
  );
}
