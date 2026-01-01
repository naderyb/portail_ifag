export const runtime = "nodejs";

import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BadgePill } from "@/components/ui/BadgePill";
import { ScheduleTable } from "@/components/student/ScheduleTable";
import dynamic from "next/dynamic";
import { getStudentDashboardData } from "@/lib/queries/student";
import { Suspense } from "react";
import { ProgressCircles } from "@/components/student/ProgressCircles";
import { ExpandScheduleButton } from "@/components/student/ExpandScheduleButton";
import { ExpandStatsButton } from "@/components/student/ExpandStatsButton";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

async function StudentDashboard() {
  // Assume authenticated student; for now a fixed test UUID or numeric id.
  const studentId = 1;
  const data = await getStudentDashboardData(studentId);

  const {
    student,
    schedule,
    notesSummary,
    absencesCount,
    announcements,
    academicProgress,
    holidaysProgress,
  } = data;

  const holidaysPercent = Math.round(holidaysProgress.percentage);
  const academicPercent = Math.round(academicProgress.percentage);
  const attendanceRate = Math.max(0, 100 - absencesCount.total * 5);
  const initials = student.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Shell
      title="Espace Étudiant"
      subtitle={`Bienvenue, ${student.full_name}`}
      variant="student"
      navItems={[
        { label: "Tableau de bord", href: "/student" },
        { label: "Notes", href: "/student/notes" },
        { label: "Emploi du temps", href: "/student/schedule" },
        { label: "Absences", href: "/student/absences" },
        { label: "Profil", href: "/student/profile" },
      ]}
    >
      <div className="relative">
        {academicPercent >= 95 && (
          <Confetti
            width={typeof window !== "undefined" ? window.innerWidth : 1200}
            height={280}
            numberOfPieces={180}
            recycle={false}
          />
        )}

        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          {/* Left column */}
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-brand-400 to-fuchsia-500 p-[2px]">
                    <div className="flex h-full w-full items-center justify-center rounded-3xl bg-slate-950 text-xl font-semibold">
                      {initials}
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-semibold">
                      {student.full_name}
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      {student.speciality_name} • {student.class_name} • Groupe{" "}
                      {student.group_name}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <BadgePill
                        label={`Niveau ${academicProgress.level}`}
                        color="purple"
                      />
                      <BadgePill label={academicProgress.label} color="green" />
                      <BadgePill
                        label={`${absencesCount.total} absences`}
                        color={absencesCount.total > 3 ? "amber" : "blue"}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-[11px] text-slate-300">
                  <div className="rounded-2xl bg-slate-900/80 px-3 py-2 ring-1 ring-slate-800/60">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      XP académique
                    </div>
                    <div className="mt-1 text-lg font-semibold text-brand-300">
                      1 240
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Gagnez de l&apos;XP en validant des modules et en
                      maintenant votre assiduité.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 px-3 py-2 ring-1 ring-slate-800/60">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Rang de promo
                    </div>
                    <div className="mt-1 text-lg font-semibold text-emerald-300">
                      5<span className="text-xs text-slate-400">/120</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Classement basé sur la moyenne générale.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 px-3 py-2 ring-1 ring-slate-800/60">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Streak de présence
                    </div>
                    <div className="mt-1 text-lg font-semibold text-amber-300">
                      12 jours
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Ne cassez pas votre série pour débloquer un badge.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <ProgressBar
                    value={academicPercent}
                    label="Progression de l'année"
                  />
                  <p className="text-xs text-slate-300">
                    Semestre actuel : {academicProgress.current_semester_name} –{" "}
                    {academicProgress.completed_credits} crédits validés sur{" "}
                    {academicProgress.total_credits}.
                  </p>

                  <ProgressBar
                    value={notesSummary.average}
                    label={`Moyenne générale (${notesSummary.modules_count} modules)`}
                  />
                  <p className="text-xs text-slate-300">
                    Meilleure matière : {notesSummary.best_module_name} (
                    {notesSummary.best_module_grade.toFixed(2)})
                  </p>
                </div>

                <ProgressCircles
                  academicPercent={academicPercent}
                  holidaysPercent={holidaysPercent}
                  daysUntilNextHoliday={holidaysProgress.days_until_next}
                  remainingWeeks={academicProgress.remaining_weeks}
                />
              </div>
            </Card>

            <Card title="Parcours & niveaux">
              <div className="space-y-4 text-xs text-slate-300">
                <p>
                  Suivez votre progression de niveau au sein de votre parcours
                  actuel. Chaque palier valide un ensemble de compétences.
                </p>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Niveau actuel</span>
                      <span>Niveau {academicProgress.level + 1}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400"
                        style={{ width: `${academicPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                      <span>Intermédiaire</span>
                      <span>Avancé</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-1 md:mt-0 md:w-40">
                    <BadgePill label="Badge • Régularité" color="green" />
                    <BadgePill label="Badge • Top 10 promo" color="purple" />
                    <BadgePill label="Badge • Zéro retard" color="amber" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card title="Vue rapide des notes">
              <ul className="space-y-2 text-xs">
                {notesSummary.modules.map((m) => (
                  <li
                    key={m.module_name}
                    className="flex items-center justify-between rounded-lg bg-slate-900/70 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-slate-50">
                        {m.module_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Coeff. {m.coefficient}
                      </div>
                    </div>
                    <span
                      className={
                        m.grade >= 10
                          ? "text-emerald-300 font-semibold"
                          : "text-amber-300 font-semibold"
                      }
                    >
                      {m.grade.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <ExpandStatsButton
                notesSummary={notesSummary}
                academicProgress={academicProgress}
                absencesCount={absencesCount}
              />
            </Card>

            <Card title="Annonces récentes">
              <ul className="space-y-3 text-xs">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-50">
                        {a.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(a.published_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300 line-clamp-3">
                      {a.content}
                    </p>
                  </li>
                ))}
                {!announcements.length && (
                  <li className="text-[11px] text-slate-400">
                    Aucune annonce pour le moment.
                  </li>
                )}
              </ul>
            </Card>

            <Card title="Widgets académiques">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 p-3">
                  <div className="text-[11px] font-medium text-emerald-200">
                    Assiduité
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-emerald-300">
                    {attendanceRate}%
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-100/80">
                    Continuez à garder un bon rythme de présence.
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 p-3">
                  <div className="text-[11px] font-medium text-violet-100">
                    Objectif hebdo
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-violet-200">
                    5h
                  </div>
                  <p className="mt-1 text-[11px] text-violet-100/80">
                    Révision personnelle pour atteindre le niveau supérieur.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="text-slate-200">Chargement...</div>}>
      <StudentDashboard />
    </Suspense>
  );
}
