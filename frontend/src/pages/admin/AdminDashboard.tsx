import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Initiative, InitiativeStatus, Petition } from '@/types';
import { initiativesApi } from '@/api/initiatives';
import { petitionsApi } from '@/api/petitions';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { InitiativeIcon, PetitionIcon, ShieldIcon, HeartIcon } from '@/components/ui/Icons';
import {
  formatCurrency,
  initiativeStatusLabels,
  initiativeStatuses,
} from '@/lib/format';

const statusBarColors: Record<InitiativeStatus, string> = {
  Pending: 'bg-amber-500',
  Active: 'bg-emerald-500',
  Completed: 'bg-brand-600',
  Rejected: 'bg-red-500',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([initiativesApi.getAll(), petitionsApi.getAll()])
      .then(([inits, pets]) => {
        if (!active) return;
        setInitiatives(inits);
        setPetitions(pets);
      })
      .catch(
        (err) => active && setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити дані.')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner className="py-24" label="Завантаження аналітики…" />;

  const totalCollected = initiatives.reduce((s, i) => s + i.collectedAmount, 0);
  const totalTarget = initiatives.reduce((s, i) => s + i.targetAmount, 0);
  const pendingCount = initiatives.filter((i) => i.status === 'Pending').length;

  const byStatus = initiativeStatuses.map((s) => ({
    status: s,
    count: initiatives.filter((i) => i.status === s).length,
  }));
  const maxCount = Math.max(1, ...byStatus.map((b) => b.count));

  return (
    <div>
      <PageHeader
        title={`Панель адміністратора`}
        subtitle={`${user?.displayName ?? ''} — аналітика та модерація платформи`}
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {pendingCount > 0 && (
        <Alert variant="info" className="mb-6">
          На розгляді {pendingCount}{' '}
          {pendingCount === 1 ? 'збір очікує' : 'зборів очікують'} перевірки.{' '}
          <Link to="/moderation" className="font-semibold underline">
            Перейти до модерації
          </Link>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Усього зборів" value={initiatives.length} icon={InitiativeIcon} />
        <StatCard
          label="Очікують перевірки"
          value={pendingCount}
          icon={ShieldIcon}
          accentClass="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Зібрано загалом"
          value={formatCurrency(totalCollected)}
          icon={HeartIcon}
          accentClass="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Петиції"
          value={petitions.length}
          icon={PetitionIcon}
          accentClass="bg-brand-100 text-brand-700"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Збори за статусом</h2>
          <div className="space-y-3">
            {byStatus.map(({ status, count }) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{initiativeStatusLabels[status]}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${statusBarColors[status]} transition-all`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Загальний прогрес зборів</h2>
          <p className="text-sm text-slate-500">Зібрано від загальної цільової суми</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            {formatCurrency(totalCollected)}
          </p>
          <p className="mb-3 text-sm text-slate-400">з {formatCurrency(totalTarget)}</p>
          <ProgressBar
            value={totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0}
            colorClass="bg-emerald-500"
          />
          <div className="mt-6 flex gap-3">
            <Link to="/moderation" className="btn-primary">
              Модерація зборів
            </Link>
            <Link to="/petitions" className="btn-secondary">
              Модерація петицій
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
