type Props = {
  label: string;
  color?: "green" | "blue" | "amber" | "purple";
};

const colorMap: Record<NonNullable<Props["color"]>, string> = {
  green: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/40",
  blue: "bg-sky-500/15 text-sky-200 ring-sky-400/40",
  amber: "bg-amber-500/15 text-amber-100 ring-amber-400/40",
  purple: "bg-violet-500/15 text-violet-200 ring-violet-400/40",
};

export function BadgePill({ label, color = "blue" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}
