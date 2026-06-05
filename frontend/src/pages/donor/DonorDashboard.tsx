import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Donation, Initiative } from '@/types';
import { donationsApi } from '@/api/donations';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { HeartIcon, HistoryIcon, SparklesIcon, InitiativeIcon } from '@/components/ui/Icons';
import { formatCurrency } from '@/lib/format';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [active, setActive] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    Promise.all([donationsApi.historyByDonor(user.id), initiativesApi.getActive()])
      .then(([dons, inits]) => {
        if (!alive) return;
        setDonations(dons);
        setActive(inits);
      })
      .catch(
        (err) => alive && setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити дані.')
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user]);

  if (loading) return <Spinner className="py-24" label="Завантаження…" />;

  const totalDonated = donations.reduce((s, d) => s + d.amount, 0);
  const featured = [...active]
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        title={`Вітаємо, ${user?.displayName ?? ''}!`}
        subtitle="Дякуємо, що робите світ кращим разом із Donatly"
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Задоновано загалом" value={formatCurrency(totalDonated)} icon={HeartIcon} />
        <StatCard
          label="Кількість донатів"
          value={donations.length}
          icon={HistoryIcon}
          accentClass="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Активні збори"
          value={active.length}
          icon={InitiativeIcon}
          accentClass="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card flex flex-col justify-between p-6 lg:col-span-1">
          <div>
            <div className="mb-2 flex items-center gap-2 text-brand-600">
              <SparklesIcon className="h-5 w-5" />
              <h2 className="font-semibold">Не знаєте, кому допомогти?</h2>
            </div>
            <p className="text-sm text-slate-500">
              AI-помічник підкаже збори за вашими інтересами та бюджетом.
            </p>
          </div>
          <Link to="/assistant" className="btn-primary mt-4">
            <SparklesIcon className="h-4 w-4" />
            Запитати AI-помічника
          </Link>
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Збори, які потребують підтримки</h2>
            <Link to="/initiatives" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Усі збори →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              Поки що немає активних зборів.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {featured.map((i) => (
                <li key={i.id} className="px-5 py-3">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-800">{i.title}</span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {Math.round(i.progressPercentage)}%
                    </span>
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
