import { useEffect, useState } from 'react';
import type { Petition } from '@/types';
import { petitionsApi } from '@/api/petitions';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { CreatePetitionModal } from '@/components/petitions/CreatePetitionModal';
import { PlusIcon, ThumbsUpIcon } from '@/components/ui/Icons';
import {
  formatDate,
  petitionStatusClasses,
  petitionStatusLabels,
  clampPercent,
} from '@/lib/format';

const VOTED_KEY = 'donatly.votedPetitions';

function loadVoted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export default function DonorPetitionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(() => loadVoted());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

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

  function rememberVoted(id: string) {
    const next = new Set(voted);
    next.add(id);
    setVoted(next);
    localStorage.setItem(VOTED_KEY, JSON.stringify([...next]));
  }

  async function vote(p: Petition) {
    if (!user) return;
    setBusyId(p.id);
    setError(null);
    setNotice(null);
    try {
      await petitionsApi.vote(p.id, user.id);
      setItems((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, currentVotes: x.currentVotes + 1 } : x))
      );
      rememberVoted(p.id);
      setNotice('Дякуємо за вашу підтримку!');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Не вдалося проголосувати.';
      setError(msg);
      // If the server says already voted, remember that locally too.
      if (err instanceof ApiError && err.status === 400) rememberVoted(p.id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Петиції"
        subtitle="Підтримуйте суспільні звернення або створіть власне"
        action={
          <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            Нова петиція
          </button>
        }
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert variant="success" className="mb-4">
          {notice}
        </Alert>
      )}

      {loading ? (
        <Spinner className="py-24" label="Завантаження петицій…" />
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-slate-500">Поки що немає жодної петиції.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => {
            const pct = clampPercent((p.currentVotes / p.targetVotes) * 100);
            const hasVoted = voted.has(p.id);
            const canVote = p.status === 'Active' && !hasVoted;
            return (
              <div key={p.id} className="card flex flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug text-slate-900">{p.title}</h3>
                  <Badge
                    label={petitionStatusLabels[p.status]}
                    className={petitionStatusClasses[p.status]}
                  />
                </div>
                <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-500">{p.body}</p>

                <ProgressBar value={pct} colorClass="bg-amber-500" />
                <div className="mt-1.5 mb-4 flex justify-between text-xs text-slate-400">
                  <span>
                    {p.currentVotes} / {p.targetVotes} голосів
                  </span>
                  <span>до {formatDate(p.deadline)}</span>
                </div>

                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={!canVote || busyId === p.id}
                  onClick={() => vote(p)}
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                  {hasVoted ? 'Ви підтримали' : p.status === 'Active' ? 'Підтримати' : 'Збір голосів закрито'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <CreatePetitionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(p) => setItems((prev) => [p, ...prev])}
      />
    </div>
  );
}
