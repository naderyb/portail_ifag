"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  ScheduleTable,
  type ScheduleSlot,
} from "@/components/student/ScheduleTable";

type Props = {
  schedule: ScheduleSlot[];
};

export function ExpandScheduleButton({ schedule }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full border border-sky-400/50 bg-slate-900/50 px-3 py-1 text-[11px] font-semibold text-sky-200 hover:bg-slate-900/95 hover:border-sky-400/80 transition-colors"
      >
        Voir l&apos;emploi du temps en grand
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Emploi du temps détaillé"
        size="xl"
      >
        <p className="mb-3 text-[11px] text-slate-300">
          Vue large de la semaine (Samedi → Jeudi) avec tous les créneaux.
        </p>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          {schedule.length ? (
            <ScheduleTable slots={schedule} />
          ) : (
            <p className="text-[11px] text-slate-400">
              Aucun créneau n&apos;est planifié pour le moment.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
