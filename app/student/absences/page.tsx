export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { getStudentDashboardData } from "@/lib/queries/student";
import Link from "next/link";

async function StudentAbsencesPage() {
  // Idéalement récupéré depuis l'auth
  const studentId = 1;
  const { student, absencesCount, absencesHistory } =
    await getStudentDashboardData(studentId);

  const studentNav = [
    { label: "Tableau de bord", href: "/student" },
    { label: "Notes", href: "/student/notes" },
    { label: "Emploi du temps", href: "/student/schedule" },
    { label: "Absences", href: "/student/absences" },
    { label: "Profil", href: "/student/profile" },
  ];

  return (
    <Shell
      title="Mes absences"
      subtitle={`Absences de ${student.full_name} • ${student.class_name} • Groupe ${student.group_name}`}
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
              <div className="flex flex-col gap-4 text-xs text-slate-300 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Synthèse des absences • {student.class_name} •{" "}
                    {student.group_name}
                  </p>
                  <p className="mt-1">
                    Spécialité : {student.speciality_name} • Promotion{" "}
                    {student.promotion_name ?? ""}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 md:mt-0">
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-xs shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Nombre total d&apos;absences
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-50">
                      {absencesCount.total}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-xs shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Pourcentage d&apos;absence (TD / TP)
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-50">
                      {absencesCount.percentage}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Historique des absences">
              {absencesHistory.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Aucune absence enregistrée pour le moment.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900/80">
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Date
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Module
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Type de séance
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Motif
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-center font-semibold text-slate-100">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {absencesHistory.map((a) => (
                        <tr key={a.id}>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {a.date}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {a.module_name || "—"}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {a.session_type || "—"}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {a.reason || "—"}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                a.justified
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                                  : "bg-rose-500/10 text-rose-300 border border-rose-500/40"
                              }`}
                            >
                              {a.justified ? "Justifiée" : "Non justifiée"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-3 text-[10px] italic text-slate-500">
                Pour toute contestation ou justification d&apos;absence,
                veuillez contacter le service scolarité.
              </p>
            </Card>
          </main>
        </div>
      </div>
    </Shell>
  );
}

export default function AbsencesPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-6 text-slate-200">
          Chargement de vos absences...
        </div>
      }
    >
      <StudentAbsencesPage />
    </Suspense>
  );
}
