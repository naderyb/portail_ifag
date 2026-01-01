"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  title: string;
  subtitle?: string;
  variant?: "student" | "admin";
  children: ReactNode;
  navItems?: { label: string; href: string }[];
  activeNavHref?: string;
};

export function Shell({
  title,
  subtitle,
  variant = "student",
  children,
  navItems,
  activeNavHref,
}: Props) {
  const isAdmin = variant === "admin";
  const pathname = usePathname();
  const currentPath = activeNavHref ?? pathname;

  return (
    <div
      className={
        isAdmin
          ? "min-h-screen bg-slate-100 text-slate-900"
          : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_#020617)] text-slate-50"
      }
    >
      <header
        className={
          isAdmin
            ? "border-b border-slate-200 bg-white/80 backdrop-blur-sm"
            : "border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
          <div>
            <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
            {subtitle && (
              <p className="text-xs text-slate-400 md:text-sm">{subtitle}</p>
            )}
            {!isAdmin && navItems?.length ? (
              <nav className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {navItems.map((item) => {
                  const isActive =
                    currentPath === item.href ||
                    (item.href !== "/" &&
                      currentPath.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        "rounded-full border px-3 py-1 transition-colors " +
                        (isActive
                          ? "border-sky-400/80 bg-slate-900/80 text-sky-100"
                          : "border-transparent bg-transparent text-slate-400 hover:border-slate-600 hover:bg-slate-900/40 hover:text-slate-100")
                      }
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Portail IFAG
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
}
