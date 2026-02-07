export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { getStudentDashboardData } from "@/lib/queries/student";
import Link from "next/link";

async function StudentNotesPage() {
  // Idéalement, récupéré depuis l'auth
  const studentId = 1;
  const { student, notesSummary } = await getStudentDashboardData(studentId);

  const studentNav = [
    { label: "Tableau de bord", href: "/student" },
    { label: "Notes", href: "/student/notes" },
    { label: "Emploi du temps", href: "/student/schedule" },
    { label: "Absences", href: "/student/absences" },
    { label: "Profil", href: "/student/profile" },
  ];

  return (
    <Shell
      title="Mes notes"
      subtitle={`Notes de ${student.full_name} • ${student.class_name} • Groupe ${student.group_name}`}
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
              <div className="flex flex-col gap-4 text-sm text-slate-200 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-50">
                    Synthèse des notes • {student.class_name} • Groupe{" "}
                    {student.group_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Spécialité : {student.speciality_name} • Promotion{" "}
                    {student.promotion_name ?? ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-xs shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Moyenne générale
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-50">
                      {notesSummary.average.toFixed(2)}/20
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-xs shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Nombre de modules
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-50">
                      {notesSummary.modules_count}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card title="Détail des modules" className="md:col-span-2">
                {notesSummary.modules.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Aucune note n&apos;est disponible pour le moment.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-900/80">
                          <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                            Module
                          </th>
                          <th className="border-b border-slate-700 px-3 py-2 text-right font-semibold text-slate-100">
                            Coeff.
                          </th>
                          <th className="border-b border-slate-700 px-3 py-2 text-right font-semibold text-slate-100">
                            Note / 20
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {notesSummary.modules.map((m) => (
                          <tr key={m.module_name}>
                            <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                              {m.module_name}
                            </td>
                            <td className="border-b border-slate-800 px-3 py-2 text-right text-slate-100">
                              {m.coefficient}
                            </td>
                            <td className="border-b border-slate-800 px-3 py-2 text-right text-slate-100">
                              {m.grade.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mt-3 text-[10px] italic text-slate-500">
                  Les notes affichées sont données à titre indicatif et peuvent
                  être sujettes à rectification par l&apos;administration.
                </p>
              </Card>

              <div className="space-y-4">
                <Card title="Meilleur module">
                  <div className="text-sm text-slate-100">
                    <p className="text-xs text-slate-400">Module</p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {notesSummary.best_module_name}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">Note</p>
                    <p className="mt-0.5 text-lg font-semibold text-emerald-300">
                      {notesSummary.best_module_grade.toFixed(2)}/20
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Shell>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-6 text-slate-200">
          Chargement de vos notes...
        </div>
      }
    >
      <StudentNotesPage />
    </Suspense>
  );
}
