import { useEffect, useState, type FormEvent } from 'react';
import type { Petition } from '@/types';
import { petitionsApi } from '@/api/petitions';
import { ApiError } from '@/api/client';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';

interface CreatePetitionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (petition: Petition) => void;
}

const empty = { title: '', body: '', targetVotes: '', deadline: '' };

export function CreatePetitionModal({ open, onClose, onCreated }: CreatePetitionModalProps) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(empty);
      setError(null);
    }
  }, [open]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const votes = Number(form.targetVotes);
    if (!Number.isInteger(votes) || votes <= 0) {
      setError('Вкажіть додатну цільову кількість голосів.');
      return;
    }
    if (!form.deadline) {
      setError('Вкажіть кінцеву дату.');
      return;
    }

    setBusy(true);
    try {
      const created = await petitionsApi.create({
        title: form.title,
        body: form.body,
        targetVotes: votes,
        deadline: new Date(form.deadline).toISOString(),
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося створити петицію.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Нова петиція"
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            Скасувати
          </button>
          <button type="submit" form="create-petition-form" className="btn-primary" disabled={busy}>
            {busy ? 'Створення…' : 'Створити петицію'}
          </button>
        </>
      }
    >
      <form id="create-petition-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <label className="label" htmlFor="cp-title">
            Назва петиції
          </label>
          <input
            id="cp-title"
            className="input"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Облаштування велодоріжок на вулиці Науки"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="cp-body">
            Текст петиції
          </label>
          <textarea
            id="cp-body"
            className="input min-h-[110px] resize-y"
            value={form.body}
            onChange={(e) => update('body', e.target.value)}
            placeholder="Опишіть суть звернення та обґрунтування…"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="cp-target">
              Ціль голосів
            </label>
            <input
              id="cp-target"
              type="number"
              min="1"
              step="1"
              className="input"
              value={form.targetVotes}
              onChange={(e) => update('targetVotes', e.target.value)}
              placeholder="250"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="cp-deadline">
              Кінцева дата
            </label>
            <input
              id="cp-deadline"
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
