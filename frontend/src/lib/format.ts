import type { InitiativeStatus, PetitionStatus } from '@/types';

const currencyFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value ?? 0);
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Converts an ISO date-time into a value suitable for <input type="date">. */
export function toDateInputValue(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** Days remaining until the deadline (negative if past). */
export function daysLeft(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ----- Initiative status presentation -----
export const initiativeStatusLabels: Record<InitiativeStatus, string> = {
  Pending: 'На розгляді',
  Active: 'Активна',
  Completed: 'Завершена',
  Rejected: 'Відхилена',
};

export const initiativeStatusClasses: Record<InitiativeStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Active: 'bg-emerald-100 text-emerald-800',
  Completed: 'bg-brand-100 text-brand-800',
  Rejected: 'bg-red-100 text-red-800',
};

export const initiativeStatuses: InitiativeStatus[] = [
  'Pending',
  'Active',
  'Completed',
  'Rejected',
];

// ----- Petition status presentation -----
export const petitionStatusLabels: Record<PetitionStatus, string> = {
  Draft: 'Чернетка',
  Active: 'Активна',
  Successful: 'Успішна',
  Closed: 'Закрита',
};

export const petitionStatusClasses: Record<PetitionStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Active: 'bg-emerald-100 text-emerald-800',
  Successful: 'bg-brand-100 text-brand-800',
  Closed: 'bg-slate-200 text-slate-600',
};

export const petitionStatuses: PetitionStatus[] = [
  'Draft',
  'Active',
  'Successful',
  'Closed',
];

export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
