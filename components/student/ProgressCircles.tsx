"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Props = {
  academicPercent: number;
  holidaysPercent: number;
  daysUntilNextHoliday: number;
  remainingWeeks: number;
};

export function ProgressCircles({
  academicPercent,
  holidaysPercent,
  daysUntilNextHoliday,
  remainingWeeks,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="w-28">
        <CircularProgressbar
          value={holidaysPercent}
          text={`${holidaysPercent}%`}
          styles={buildStyles({
            textColor: "#e5e7eb",
            pathColor: "#22c55e",
            trailColor: "#020617",
            textSize: "24px",
          })}
        />
        <p className="mt-2 text-center text-[11px] text-slate-300">
          Prochaine vacance dans {daysUntilNextHoliday} jours
        </p>
      </div>
      <div className="w-28">
        <CircularProgressbar
          value={100 - academicPercent}
          text={`${remainingWeeks} sem`}
          styles={buildStyles({
            textColor: "#e5e7eb",
            pathColor: "#38bdf8",
            trailColor: "#020617",
            textSize: "22px",
          })}
        />
        <p className="mt-2 text-center text-[11px] text-slate-300">
          Semaines restantes avant la fin d&apos;année
        </p>
      </div>
    </div>
  );
}
