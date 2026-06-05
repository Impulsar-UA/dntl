import { useEffect, useState, type FormEvent } from 'react';
import type { Initiative } from '@/types';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { toDateInputValue } from '@/lib/format';

interface InitiativeFormModalProps {
  open: boolean;
  /** When provided the modal works in edit mode. */
  initiative?: Initiative | null;
  onClose: () => void;
  onSaved: (saved: Initiative) => void;
}

interface FormState {
  title: string;
  description: string;
  targetAmount: string;
  deadline: string;
}

const emptyForm: FormState = {
  title: '',
  description: '',
  targetAmount: '',
  deadline: '',
};

/**
 * Form used by Organization Representatives to create / edit their own
 * initiatives. Status and government-support are NOT editable here — those
 * are administrator responsibilities handled in the moderation panel.
 * On update the original status and gov-support flag are preserved.
 */
export function InitiativeFormModal({
  open,
  initiative,
  onClose,
  onSaved,
}: InitiativeFormModalProps) {
  const { user } = useAuth();
  const isEdit = Boolean(initiative);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initiative) {
      setForm({
        title: initiative.title,
        description: initiative.description,
        targetAmount: String(initiative.targetAmount),
        deadline: toDateInputValue(initiative.deadline),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, initiative]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const amount = Number(form.targetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Цільова сума має бути додатним числом.');
      return;
    }
    if (!form.deadline) {
      setError('Вкажіть кінцеву дату збору.');
      return;
    }

    const deadlineIso = new Date(form.deadline).toISOString();

    setSaving(true);
    try {
      let saved: Initiative;
      if (isEdit && initiative) {
        saved = await initiativesApi.update(initiative.id, {
          title: form.title,
          description: form.description,
          targetAmount: amount,
          deadline: deadlineIso,
          // Preserve admin-controlled fields untouched.
          status: initiative.status,
          isGovernmentSupported: initiative.isGovernmentSupported,
        });
      } else {
        if (!user) throw new ApiError(0, 'Сесія недійсна. Увійдіть знову.');
        saved = await initiativesApi.create({
          title: form.title,
          description: form.description,
          targetAmount: amount,
          deadline: deadlineIso,
          organizationRepId: user.id,
        });
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти збір.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Редагувати збір' : 'Новий збір'}
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Скасувати
          </button>
          <button type="submit" form="initiative-form" className="btn-primary" disabled={saving}>
            {saving ? 'Збереження…' : isEdit ? 'Зберегти зміни' : 'Створити збір'}
          </button>
        </>
      }
    >
      <form id="initiative-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        {!isEdit && (
          <Alert variant="info">
            Новий збір створюється зі статусом «На розгляді» та публікується після
            перевірки адміністратором.
          </Alert>
        )}

        <div>
          <label className="label" htmlFor="title">
            Назва збору
          </label>
          <input
            id="title"
            className="input"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Закупівля медикаментів для лікарні"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Опис
          </label>
          <textarea
            id="description"
            className="input min-h-[110px] resize-y"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Детальний опис цілей збору та використання коштів…"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="targetAmount">
              Цільова сума (грн)
            </label>
            <input
              id="targetAmount"
              type="number"
              min="1"
              step="1"
              className="input"
              value={form.targetAmount}
              onChange={(e) => update('targetAmount', e.target.value)}
              placeholder="150000"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="deadline">
              Кінцева дата
            </label>
            <input
              id="deadline"
              type="date"
              className="input"
              value={form.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
