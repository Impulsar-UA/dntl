import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Initiative, InitiativeStatus } from '@/types';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InitiativeFormModal } from '@/components/initiatives/InitiativeFormModal';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon } from '@/components/ui/Icons';
import {
  formatCurrency,
  formatDate,
  initiativeStatusClasses,
  initiativeStatusLabels,
  initiativeStatuses,
} from '@/lib/format';

type StatusFilter = 'all' | InitiativeStatus;

export default function MyInitiativesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | null>(null);
  const [deleting, setDeleting] = useState<Initiative | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const all = await initiativesApi.getAll();
      setItems(all.filter((i) => i.organizationRepId === user?.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити збори.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  function handleSaved(saved: Initiative) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx === -1) return [saved, ...prev];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
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
        title="Мої збори"
        subtitle="Створення та ведення власних благодійних зборів"
        action={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Новий збір
          </button>
        }
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
          <p className="text-sm text-slate-500">
            {items.length === 0
              ? 'У вас ще немає зборів. Створіть перший!'
              : 'Немає зборів за цим фільтром.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Назва</th>
                  <th className="px-4 py-3 font-semibold">Прогрес</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Дедлайн</th>
                  <th className="px-4 py-3 text-right font-semibold">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/initiatives/${i.id}`}
                        className="font-medium text-slate-800 hover:text-brand-600"
                      >
                        {i.title}
                      </Link>
                      {i.isGovernmentSupported && (
                        <Badge label="Держпідтримка" className="ml-2 bg-blue-100 text-blue-700" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-40">
                        <ProgressBar value={i.progressPercentage} />
                        <div className="mt-1 flex justify-between text-xs text-slate-400">
                          <span>{formatCurrency(i.collectedAmount)}</span>
                          <span>{Math.round(i.progressPercentage)}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={initiativeStatusLabels[i.status]}
                        className={initiativeStatusClasses[i.status]}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(i.deadline)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/initiatives/${i.id}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Деталі"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600"
                          title="Редагувати"
                          onClick={() => {
                            setEditing(i);
                            setFormOpen(true);
                          }}
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Видалити"
                          onClick={() => setDeleting(i)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InitiativeFormModal
        open={formOpen}
        initiative={editing}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

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
