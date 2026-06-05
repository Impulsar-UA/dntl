import { useEffect, useMemo, useState } from 'react';
import type { Initiative, InitiativeStatus } from '@/types';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CheckIcon, CloseIcon, TrashIcon, ShieldIcon } from '@/components/ui/Icons';
import {
  formatCurrency,
  formatDate,
  initiativeStatusClasses,
  initiativeStatusLabels,
  initiativeStatuses,
} from '@/lib/format';

type StatusFilter = 'all' | InitiativeStatus;

export default function InitiativeModerationPage() {
  const [items, setItems] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Initiative | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await initiativesApi.getAll());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити збори.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  function replaceItem(saved: Initiative) {
    setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
  }

  async function patch(
    item: Initiative,
    changes: Partial<Pick<Initiative, 'status' | 'isGovernmentSupported'>>
  ) {
    setBusyId(item.id);
    setError(null);
    try {
      const saved = await initiativesApi.update(item.id, {
        title: item.title,
        description: item.description,
        targetAmount: item.targetAmount,
        deadline: item.deadline,
        status: changes.status ?? item.status,
        isGovernmentSupported: changes.isGovernmentSupported ?? item.isGovernmentSupported,
      });
      replaceItem(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося оновити збір.');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await initiativesApi.remove(deleting.id);
      setItems((prev) => prev.filter((i) => i.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося видалити збір.');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Модерація зборів"
        subtitle="Перевірка, підтвердження та керування статусами всіх зборів платформи"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', ...initiativeStatuses] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === s
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? 'Усі' : initiativeStatusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner className="py-24" label="Завантаження зборів…" />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-slate-500">Немає зборів за цим фільтром.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((i) => {
            const busy = busyId === i.id;
            return (
              <div key={i.id} className="card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{i.title}</h3>
                      <Badge
                        label={initiativeStatusLabels[i.status]}
                        className={initiativeStatusClasses[i.status]}
                      />
                      {i.isGovernmentSupported && (
                        <Badge label="Держпідтримка" className="bg-blue-100 text-blue-700" />
                      )}
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-500">{i.description}</p>
                    <div className="max-w-md">
                      <ProgressBar value={i.progressPercentage} />
                      <div className="mt-1 flex justify-between text-xs text-slate-400">
                        <span>
                          {formatCurrency(i.collectedAmount)} з {formatCurrency(i.targetAmount)}
                        </span>
                        <span>до {formatDate(i.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-72 lg:justify-end">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={busy || i.status === 'Active'}
                      onClick={() => patch(i, { status: 'Active' })}
                      title="Підтвердити та опублікувати"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Підтвердити
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={busy || i.status === 'Rejected'}
                      onClick={() => patch(i, { status: 'Rejected' })}
                    >
                      <CloseIcon className="h-4 w-4" />
                      Відхилити
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={busy || i.status === 'Completed'}
                      onClick={() => patch(i, { status: 'Completed' })}
                    >
                      Завершити
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={busy}
                      onClick={() =>
                        patch(i, { isGovernmentSupported: !i.isGovernmentSupported })
                      }
                      title="Маркування державної підтримки"
                    >
                      <ShieldIcon className="h-4 w-4" />
                      {i.isGovernmentSupported ? 'Зняти держпідтримку' : 'Держпідтримка'}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost text-red-600 hover:bg-red-50"
                      disabled={busy}
                      onClick={() => setDeleting(i)}
                    >
                      <TrashIcon className="h-4 w-4" />
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Видалити збір?"
        message={`Збір «${deleting?.title ?? ''}» буде видалено без можливості відновлення.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
