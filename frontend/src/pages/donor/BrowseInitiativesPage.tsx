import { useEffect, useMemo, useState } from 'react';
import type { Initiative, Donation } from '@/types';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { DonateModal } from '@/components/donor/DonateModal';
import { HeartIcon, SearchIcon } from '@/components/ui/Icons';
import { formatCurrency, formatDate, daysLeft } from '@/lib/format';

export default function BrowseInitiativesPage() {
  const [items, setItems] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'urgent' | 'progress' | 'newest'>('urgent');

  const [donateFor, setDonateFor] = useState<Initiative | null>(null);
  const [thanks, setThanks] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    initiativesApi
      .getActive()
      .then((data) => active && setItems(data))
      .catch(
        (err) => active && setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити збори.')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
        )
      : [...items];

    if (sort === 'urgent') list.sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
    else if (sort === 'progress') list.sort((a, b) => b.progressPercentage - a.progressPercentage);
    else list.sort((a, b) => +new Date(b.deadline) - +new Date(a.deadline));

    return list;
  }, [items, query, sort]);

  function handleDonated(d: Donation) {
    setThanks(`Дякуємо! Ваш донат на ${formatCurrency(d.amount)} зараховано.`);
    // Reflect the new collected amount locally.
    setItems((prev) =>
      prev.map((i) =>
        i.id === d.initiativeId
          ? {
              ...i,
              collectedAmount: i.collectedAmount + d.amount,
              progressPercentage:
                i.targetAmount > 0
                  ? ((i.collectedAmount + d.amount) / i.targetAmount) * 100
                  : 0,
            }
          : i
      )
    );
  }

  return (
    <div>
      <PageHeader title="Збори" subtitle="Оберіть ініціативу, яку хочете підтримати" />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {thanks && (
        <Alert variant="success" className="mb-4">
          {thanks}
        </Alert>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Пошук зборів за назвою або описом…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-56"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="urgent">Спочатку термінові</option>
          <option value="progress">За прогресом</option>
          <option value="newest">Найновіші</option>
        </select>
      </div>

      {loading ? (
        <Spinner className="py-24" label="Завантаження зборів…" />
      ) : visible.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-slate-500">
            {items.length === 0 ? 'Поки що немає активних зборів.' : 'Нічого не знайдено.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((i) => {
            const left = daysLeft(i.deadline);
            return (
              <div key={i.id} className="card flex flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug text-slate-900">{i.title}</h3>
                  {i.isGovernmentSupported && (
                    <Badge label="Держпідтримка" className="shrink-0 bg-blue-100 text-blue-700" />
                  )}
                </div>
                <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-500">{i.description}</p>

                <ProgressBar value={i.progressPercentage} />
                <div className="mt-1.5 mb-3 flex justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-600">
                    {formatCurrency(i.collectedAmount)}
                  </span>
                  <span>з {formatCurrency(i.targetAmount)}</span>
                </div>

                <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{Math.round(i.progressPercentage)}% зібрано</span>
                  <span>{left > 0 ? `залишилось ${left} дн.` : 'збір завершується'}</span>
                </div>

                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => setDonateFor(i)}
                >
                  <HeartIcon className="h-4 w-4" />
                  Підтримати
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  до {formatDate(i.deadline)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <DonateModal
        open={donateFor !== null}
        initiative={donateFor}
        onClose={() => setDonateFor(null)}
        onDonated={handleDonated}
      />
    </div>
  );
}
