interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className = 'bg-slate-100 text-slate-700' }: BadgeProps) {
  return <span className={`badge ${className}`}>{label}</span>;
}
