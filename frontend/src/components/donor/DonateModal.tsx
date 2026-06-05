import { useEffect, useState, type FormEvent } from 'react';
import type { Initiative, Donation } from '@/types';
import { donationsApi } from '@/api/donations';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { CreditCardIcon } from '@/components/ui/Icons';
import { formatCurrency } from '@/lib/format';

interface DonateModalProps {
  open: boolean;
  initiative: Initiative | null;
  onClose: () => void;
  onDonated: (donation: Donation) => void;
}

const PRESETS = [100, 250, 500, 1000];

/**
 * Donation dialog with a simulated bank/card form (payment stub).
 * No real money moves — the backend records a simulated PaymentTransaction.
 */
export function DonateModal({ open, initiative, onClose, onDonated }: DonateModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('250');
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('250');
      setCard('');
      setExpiry('');
      setCvv('');
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const value = Number(amount);
    if (!Number.isFinite(value) || value < 10) {
      setError('Мінімальна сума донату — 10 грн.');
      return;
    }
    if (card.replace(/\s/g, '').length < 12) {
      setError('Введіть номер картки (демо — будь-які цифри).');
      return;
    }
    if (!user || !initiative) return;

    setBusy(true);
    try {
      const donation = await donationsApi.donate({
        donorId: user.id,
        initiativeId: initiative.id,
        amount: value,
        currency: 'UAH',
      });
      onDonated(donation);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося провести донат.');
    } finally {
      setBusy(false);
    }
  }

  function formatCard(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  return (
    <Modal
      open={open}
      title={initiative ? `Підтримати: ${initiative.title}` : 'Донат'}
      onClose={onClose}
      widthClass="max-w-md"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            Скасувати
          </button>
          <button type="submit" form="donate-form" className="btn-primary" disabled={busy}>
            {busy ? 'Обробка…' : `Задонатити ${formatCurrency(Number(amount) || 0)}`}
          </button>
        </>
      }
    >
      <form id="donate-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Alert variant="info">
          Демо-режим оплати: реальні кошти не списуються. Транзакція імітується платіжним
          шлюзом (sandbox).
        </Alert>

        <div>
          <label className="label">Сума донату</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  Number(amount) === p
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p} грн
              </button>
            ))}
          </div>
          <input
            type="number"
            min="10"
            step="1"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="card">
            <span className="inline-flex items-center gap-1.5">
              <CreditCardIcon className="h-4 w-4" /> Номер картки
            </span>
          </label>
          <input
            id="card"
            inputMode="numeric"
            className="input font-mono"
            placeholder="0000 0000 0000 0000"
            value={card}
            onChange={(e) => setCard(formatCard(e.target.value))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="expiry">
              Термін дії
            </label>
            <input
              id="expiry"
              className="input font-mono"
              placeholder="MM/YY"
              value={expiry}
              maxLength={5}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="cvv">
              CVV
            </label>
            <input
              id="cvv"
              className="input font-mono"
              placeholder="123"
              maxLength={3}
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
