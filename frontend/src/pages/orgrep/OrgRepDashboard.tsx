import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Initiative } from '@/types';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { HeartIcon, InitiativeIcon, CheckIcon } from '@/components/ui/Icons';
import {
  formatCurrency,
  initiativeStatusClasses,
  initiativeStatusLabels,
} from '@/lib/format';

export default function OrgRepDashboard() {
  const { user } = useAuth();
  const [all, setAll] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    initiativesApi
      .getAll()
      .then((data) => active && setAll(data))
      .catch(
        (err) =>
          active && setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити дані.')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Only this representative's own initiatives.
  const mine = useMemo(
    () => all.filter((i) => i.organizationRepId === user?.id),
    [all, user?.id]
  );

  if (loading) return <Spinner className="py-24" label="Завантаження…" />;

  const active = mine.filter((i) => i.status === 'Active').length;
  const pending = mine.filter((i) => i.status === 'Pending').length;
  const completed = mine.filter((i) => i.status === 'Completed').length;
  const totalCollected = mine.reduce((s, i) => s + i.collectedAmount, 0);
  const top = [...mine].sort((a, b) => b.collectedAmount - a.collectedAmount).slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Вітаємо, ${user?.displayName ?? ''}!`}
        subtitle="Огляд ваших благодійних зборів"
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Мої збори" value={mine.length} icon={InitiativeIcon} />
        <StatCard
          label="Активні"
          value={active}
          icon={HeartIcon}
          accentClass="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="На розгляді"
          value={pending}
          icon={InitiativeIcon}
          accentClass="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Завершені"
          value={completed}
          icon={CheckIcon}
          accentClass="bg-brand-100 text-brand-700"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Зібрано за моїми зборами</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            {formatCurrency(totalCollected)}
          </p>
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Мої збори</h2>
            <Link
              to="/initiatives"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Керувати →
            </Link>
          </div>
          {top.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-400">У вас ще немає зборів.</p>
              <Link to="/initiatives" className="btn-primary mt-3 inline-flex">
                Створити перший збір
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {top.map((i) => (
                <li key={i.id} className="px-5 py-3">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <Link
                      to={`/initiatives/${i.id}`}
                      className="truncate text-sm font-medium text-slate-800 hover:text-brand-600"
                    >
                      {i.title}
                    </Link>
                    <Badge
                      label={initiativeStatusLabels[i.status]}
                      className={initiativeStatusClasses[i.status]}
                    />
                  </div>
                  <ProgressBar value={i.progressPercentage} />
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>{formatCurrency(i.collectedAmount)}</span>
                    <span>з {formatCurrency(i.targetAmount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
