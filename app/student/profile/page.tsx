export const runtime = "nodejs";

import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { getStudentDashboardData } from "@/lib/queries/student";
import Link from "next/link";

async function StudentProfilePage() {
  // Idéalement récupéré depuis l'auth
  const studentId = 1;
  const { student, academicProgress } = await getStudentDashboardData(
    studentId
  );

  const initials = student.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const studentNav = [
    { label: "Tableau de bord", href: "/student" },
    { label: "Notes", href: "/student/notes" },
    { label: "Emploi du temps", href: "/student/schedule" },
    { label: "Absences", href: "/student/absences" },
    { label: "Profil", href: "/student/profile" },
  ];

  return (
    <Shell
      title="Mon profil"
      subtitle={`${student.full_name} • ${student.class_name} • Groupe ${student.group_name}`}
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
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-slate-100">
                    {initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-50">
                      {student.full_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {student.class_name} • Groupe {student.group_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Spécialité : {student.speciality_name} • Promotion{" "}
                      {student.promotion_name ?? ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Progression académique
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-50">
                      {academicProgress.percentage}%
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {academicProgress.label}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Crédits validés
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-50">
                      {academicProgress.completed_credits}/
                      {academicProgress.total_credits}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {academicProgress.current_semester_name}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card title="Informations personnelles">
                <dl className="space-y-3 text-xs text-slate-200">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Nom complet</dt>
                    <dd className="text-right text-slate-100">
                      {student.full_name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Identifiant</dt>
                    <dd className="text-right text-slate-100">{student.id}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Promotion</dt>
                    <dd className="text-right text-slate-100">
                      {student.promotion_name ?? "—"}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card title="Informations académiques">
                <dl className="space-y-3 text-xs text-slate-200">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Classe</dt>
                    <dd className="text-right text-slate-100">
                      {student.class_name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Groupe</dt>
                    <dd className="text-right text-slate-100">
                      {student.group_name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Spécialité</dt>
                    <dd className="text-right text-slate-100">
                      {student.speciality_name}
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </Shell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-6 text-slate-200">
          Chargement de votre profil...
        </div>
      }
    >
      <StudentProfilePage />
    </Suspense>
  );
}
