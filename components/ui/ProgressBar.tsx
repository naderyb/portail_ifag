type Props = {
  value: number; // 0-100
  label?: string;
};

export function ProgressBar({ value, label }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>{label}</span>
          <span className="font-medium text-slate-100">{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-brand-400 to-cyan-400 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
