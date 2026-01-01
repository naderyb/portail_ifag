"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { BadgePill } from "@/components/ui/BadgePill";

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

type AcademicProgress = {
  percentage: number;
  level: number;
  label: string;
  current_semester_name: string;
  completed_credits: number;
  total_credits: number;
  remaining_weeks: number;
};

type AbsencesCount = { total: number };

type Props = {
  notesSummary: NotesSummary;
  academicProgress: AcademicProgress;
  absencesCount: AbsencesCount;
};

export function ExpandStatsButton({
  notesSummary,
  academicProgress,
  absencesCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const attendanceRate = Math.max(0, 100 - absencesCount.total * 5);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center rounded-full border border-emerald-400/40 bg-slate-900/50 px-3 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-slate-900/90 hover:border-emerald-400/80 transition-colors"
      >
        Voir le détail de la progression
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Détails académiques et progression"
        size="lg"
      >
        <div className="space-y-4 text-xs text-slate-200">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold text-slate-200">
                  Progression annuelle
                </div>
                <div className="mt-1 text-lg font-semibold text-brand-300">
                  {Math.round(academicProgress.percentage)}%
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {academicProgress.current_semester_name} •{" "}
                  {academicProgress.completed_credits}/
                  {academicProgress.total_credits} crédits validés
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <BadgePill
                  label={`Niveau ${academicProgress.level}`}
                  color="purple"
                />
                <BadgePill label={academicProgress.label} color="green" />
                <BadgePill
                  label={`${academicProgress.remaining_weeks} semaines restantes`}
                  color="amber"
                />
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-brand-400 to-cyan-400"
                style={{ width: `${academicProgress.percentage}%` }}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-200">
                Détail des modules ({notesSummary.modules_count})
              </span>
              <span className="text-[11px] text-slate-400">
                Moyenne générale:{" "}
                <span className="font-semibold text-emerald-300">
                  {notesSummary.average.toFixed(2)}
                </span>
              </span>
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {notesSummary.modules.map((m) => (
                <div
                  key={m.module_name}
                  className="flex items-center justify-between rounded-lg bg-slate-900/70 px-2.5 py-1.5"
                >
                  <div>
                    <div className="text-[11px] font-medium text-slate-50">
                      {m.module_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Coeff. {m.coefficient}
                    </div>
                  </div>
                  <span
                    className={
                      m.grade >= 10
                        ? "text-emerald-300 text-[11px] font-semibold"
                        : "text-amber-300 text-[11px] font-semibold"
                    }
                  >
                    {m.grade.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-200">
                  Assiduité et comportement
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Total d&apos;absences enregistrées :{" "}
                  <span className="font-semibold text-amber-300">
                    {absencesCount.total}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-emerald-300">
                  {attendanceRate}% d&apos;assiduité
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Un bon niveau d&apos;assiduité augmente vos chances de réussir
                  l&apos;année.
                </p>
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}
