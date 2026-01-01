"use client";

export type ScheduleSlot = {
  day: string;
  start: string;
  end: string;
  subject: string;
  room: string;
  teacher: string;
};

type Props = {
  slots: ScheduleSlot[];
};

const daysOrder = ["Samedi", "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];

const parseTimeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function ScheduleTable({ slots }: Props) {
  const grouped: Record<string, ScheduleSlot[]> = {};
  slots.forEach((slot) => {
    if (!grouped[slot.day]) grouped[slot.day] = [];
    grouped[slot.day].push(slot);
  });

  const todayIndex = new Date().getDay(); // 0=Dimanche ... 6=Samedi
  const todayLabel = daysOrder[todayIndex] ?? null;

  return (
    <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-6 md:gap-4">
      {daysOrder.map((day) => {
        const isToday = day === todayLabel;
        const daySlots = (grouped[day] ?? [])
          .slice()
          .sort(
            (a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start)
          );

        return (
          <div
            key={day}
            className={`flex flex-col gap-2 rounded-2xl p-3.5 border backdrop-blur-sm transition-all duration-150 ${
              isToday
                ? "bg-slate-900/95 border-brand-400/60 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
                : "bg-slate-900/70 border-slate-800/80 hover:border-slate-600/80"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide">
              <span className="text-slate-200">{day}</span>
              {isToday && (
                <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-medium text-brand-200">
                  Aujourd&apos;hui
                </span>
              )}
            </div>
            {daySlots.length ? (
              daySlots.map((s, i) => (
                <div
                  key={`${s.subject}-${s.start}-${i}`}
                  className="rounded-xl bg-slate-800/90 px-2.5 py-1.5 text-[11px] border border-slate-700/70 shadow-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-slate-50 line-clamp-1">
                      {s.subject}
                    </span>
                    <span className="text-slate-400 whitespace-nowrap">
                      {s.start}–{s.end}
                    </span>
                  </div>
                  <div className="mt-0.5 flex justify-between gap-2 text-[10px] text-slate-400">
                    <span className="truncate">{s.teacher}</span>
                    <span className="whitespace-nowrap">Salle {s.room}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-1 text-[11px] text-slate-500">Aucun cours</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
