import { clampPercent } from '@/lib/format';

interface ProgressBarProps {
  value: number; // 0..100
  className?: string;
  colorClass?: string;
}

export function ProgressBar({
  value,
  className = '',
  colorClass = 'bg-brand-600',
}: ProgressBarProps) {
  const pct = clampPercent(value);
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className={`h-full rounded-full ${colorClass} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
