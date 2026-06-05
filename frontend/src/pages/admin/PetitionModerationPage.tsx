import { useEffect, useMemo, useState } from 'react';
import type { Petition, PetitionStatus } from '@/types';
import { petitionsApi } from '@/api/petitions';
import { ApiError } from '@/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TrashIcon } from '@/components/ui/Icons';
import {
  formatDate,
  petitionStatusClasses,
  petitionStatusLabels,
  petitionStatuses,
  clampPercent,
} from '@/lib/format';

type StatusFilter = 'all' | PetitionStatus;

export default function PetitionModerationPage() {
  const [items, setItems] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Petition | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await petitionsApi.getAll());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити петиції.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((p) => p.status === filter)),
    [items, filter]
  );

  async function changeStatus(petition: Petition, status: PetitionStatus) {
    setBusyId(petition.id);
    setError(null);
    try {
      const saved = await petitionsApi.update(petition.id, {
        title: petition.title,
        body: petition.body,
        targetVotes: petition.targetVotes,
        deadline: petition.deadline,
        status,
      });
      setItems((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося змінити статус.');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await petitionsApi.remove(deleting.id);
      setItems((prev) => prev.filter((p) => p.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося видалити петицію.');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Модерація петицій"
        subtitle="Контроль вмісту, зміна статусу та видалення неприйнятних петицій"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', ...petitionStatuses] as StatusFilter[]).map((s) => (
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
            {s === 'all' ? 'Усі' : petitionStatusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner className="py-24" label="Завантаження петицій…" />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-slate-500">Немає петицій за цим фільтром.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const pct = clampPercent((p.currentVotes / p.targetVotes) * 100);
            const busy = busyId === p.id;
            return (
              <div key={p.id} className="card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{p.title}</h3>
                      <Badge
                        label={petitionStatusLabels[p.status]}
                        className={petitionStatusClasses[p.status]}
                      />
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-500">{p.body}</p>
                    <div className="max-w-md">
                      <ProgressBar value={pct} colorClass="bg-amber-500" />
                      <div className="mt-1 flex justify-between text-xs text-slate-400">
                        <span>
                          {p.currentVotes} / {p.targetVotes} голосів
                        </span>
                        <span>до {formatDate(p.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:w-80 lg:justify-end">
                    <select
                      className="input max-w-[180px]"
                      value={p.status}
                      disabled={busy}
                      onChange={(e) => changeStatus(p, e.target.value as PetitionStatus)}
                    >
                      {petitionStatuses.map((s) => (
                        <option key={s} value={s}>
                          {petitionStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-ghost text-red-600 hover:bg-red-50"
                      disabled={busy}
                      onClick={() => setDeleting(p)}
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
        title="Видалити петицію?"
        message={`Петицію «${deleting?.title ?? ''}» буде видалено без можливості відновлення.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
