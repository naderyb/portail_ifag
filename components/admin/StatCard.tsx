type Props = {
  label: string;
  value: string | number;
  trend?: string;
};

export function StatCard({ label, value, trend }: Props) {
  const trendColor =
    trend && trend.trim().startsWith("-")
      ? "text-rose-600"
      : "text-emerald-600";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 p-[1px]">
      <div className="h-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
        {trend && (
          <div className={`mt-1 text-xs font-medium ${trendColor}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
