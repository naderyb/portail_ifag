import type { ReactNode } from "react";
import clsx from "classnames";

type Props = {
  title?: string;
  className?: string;
  children: ReactNode;
};

export function Card({ title, className, children }: Props) {
  return (
    <section
      className={clsx(
        "rounded-3xl bg-slate-900/80 ring-1 ring-slate-800/80 p-4 md:p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-xl transition-all hover:ring-slate-500/80 hover:shadow-[0_22px_60px_rgba(15,23,42,1)]",
        className
      )}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
            {title}
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-slate-600/70 via-slate-700/40 to-transparent" />
        </div>
      )}
      {children}
    </section>
  );
}
