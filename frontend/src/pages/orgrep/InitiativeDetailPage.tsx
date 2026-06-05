import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Initiative } from '@/types';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InitiativeFormModal } from '@/components/initiatives/InitiativeFormModal';
import { ShareMenu } from '@/components/initiatives/ShareMenu';
import { EditIcon, TrashIcon } from '@/components/ui/Icons';
import {
  formatCurrency,
  formatDate,
  daysLeft,
  toDateInputValue,
  initiativeStatusClasses,
  initiativeStatusLabels,
} from '@/lib/format';

export default function InitiativeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [extendOpen, setExtendOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState('');
  const [extendBusy, setExtendBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    initiativesApi
      .getById(id)
      .then((data) => active && setItem(data))
      .catch(
        (err) => active && setError(err instanceof ApiError ? err.message : 'Збір не знайдено.')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function confirmDelete() {
    if (!item) return;
    setDeleteBusy(true);
    try {
      await initiativesApi.remove(item.id);
      navigate('/initiatives', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося видалити збір.');
      setDeleteBusy(false);
    }
  }

  async function confirmExtend() {
    if (!item || !newDeadline) return;
    setExtendBusy(true);
    setError(null);
    try {
      const updated = await initiativesApi.update(item.id, {
        title: item.title,
        description: item.description,
        targetAmount: item.targetAmount,
        deadline: new Date(newDeadline).toISOString(),
        status: item.status,
        isGovernmentSupported: item.isGovernmentSupported,
      });
      setItem(updated);
      setExtendOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося продовжити збір.');
    } finally {
      setExtendBusy(false);
    }
  }

  if (loading) return <Spinner className="py-24" label="Завантаження збору…" />;

  if (!item) {
    return (
      <div>
        <Alert variant="error">{error ?? 'Збір не знайдено.'}</Alert>
        <Link to="/initiatives" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          ← Назад до моїх зборів
        </Link>
      </div>
    );
  }

  const isOwner = item.organizationRepId === user?.id;
  const remaining = daysLeft(item.deadline);

  return (
    <div>
      <Link
        to="/initiatives"
        className="mb-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        ← Назад до моїх зборів
      </Link>

      <PageHeader
        title={item.title}
        action={
          isOwner ? (
            <>
              <ShareMenu initiative={item} />
              <button type="button" className="btn-secondary" onClick={() => setEditOpen(true)}>
                <EditIcon className="h-4 w-4" />
                Редагувати
              </button>
              <button type="button" className="btn-danger" onClick={() => setDeleteOpen(true)}>
                <TrashIcon className="h-4 w-4" />
                Видалити
              </button>
            </>
          ) : null
        }
      />

      {!isOwner && (
        <Alert variant="info" className="mb-4">
          Цей збір належить іншій організації — доступний лише для перегляду.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge
                label={initiativeStatusLabels[item.status]}
                className={initiativeStatusClasses[item.status]}
              />
              {item.isGovernmentSupported && (
                <Badge label="Державна підтримка" className="bg-blue-100 text-blue-700" />
              )}
            </div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Опис
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {item.description}
            </p>
          </div>

          {isOwner && (
            <div className="card p-6">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Керування збором
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                Продовження терміну дії збору, якщо ціль не досягнута вчасно.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setNewDeadline(toDateInputValue(item.deadline));
                  setExtendOpen(true);
                }}
              >
                Продовжити збір
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-sm font-medium text-slate-500">Зібрано</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {formatCurrency(item.collectedAmount)}
            </p>
            <p className="text-sm text-slate-400">з {formatCurrency(item.targetAmount)}</p>
            <ProgressBar value={item.progressPercentage} className="mt-3" />
            <p className="mt-2 text-right text-sm font-semibold text-brand-600">
              {Math.round(item.progressPercentage)}%
            </p>
          </div>

          <div className="card divide-y divide-slate-100">
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-slate-500">Дедлайн</span>
              <span className="text-sm font-medium text-slate-800">{formatDate(item.deadline)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-slate-500">Залишилось</span>
              <span className="text-sm font-medium text-slate-800">
                {remaining > 0 ? `${remaining} дн.` : 'Завершено'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <InitiativeFormModal
        open={editOpen}
        initiative={item}
        onClose={() => setEditOpen(false)}
        onSaved={(saved) => setItem(saved)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Видалити збір?"
        message={`Збір «${item.title}» буде видалено без можливості відновлення.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <Modal
        open={extendOpen}
        title="Продовжити збір"
        onClose={() => setExtendOpen(false)}
        widthClass="max-w-md"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setExtendOpen(false)}
              disabled={extendBusy}
            >
              Скасувати
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={confirmExtend}
              disabled={extendBusy}
            >
              {extendBusy ? 'Збереження…' : 'Продовжити'}
            </button>
          </>
        }
      >
        <label className="label" htmlFor="new-deadline">
          Нова кінцева дата
        </label>
        <input
          id="new-deadline"
          type="date"
          className="input"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
        />
      </Modal>
    </div>
  );
}
