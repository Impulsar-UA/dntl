import { useEffect, useMemo, useState } from 'react';
import type { Donation, Initiative } from '@/types';
import { donationsApi } from '@/api/donations';
import { initiativesApi } from '@/api/initiatives';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatCurrency, formatDate } from '@/lib/format';

export default function DonationHistoryPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [initiatives, setInitiatives] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([donationsApi.historyByDonor(user.id), initiativesApi.getAll()])
      .then(([dons, inits]) => {
        if (!active) return;
        setDonations(dons);
        const map: Record<string, string> = {};
        inits.forEach((i: Initiative) => (map[i.id] = i.title));
        setInitiatives(map);
      })
      .catch(
        (err) => active && setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити історію.')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const total = useMemo(() => donations.reduce((s, d) => s + d.amount, 0), [donations]);

  if (loading) return <Spinner className="py-24" label="Завантаження історії…" />;

  return (
    <div>
      <PageHeader title="Історія донатів" subtitle="Усі ваші внески на платформі Donatly" />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="card mb-4 p-5">
        <p className="text-sm font-medium text-slate-500">Загалом задоновано</p>
        <p className="mt-1 text-3xl font-extrabold text-slate-900">{formatCurrency(total)}</p>
        <p className="text-xs text-slate-400">{donations.length} внесків</p>
      </div>

      {donations.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-slate-500">Ви ще не зробили жодного донату.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Дата</th>
                  <th className="px-4 py-3 font-semibold">Збір</th>
                  <th className="px-4 py-3 font-semibold">Сума</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{formatDate(d.timestamp)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {initiatives[d.initiativeId] ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={d.isProcessed ? 'Оброблено' : 'В обробці'}
                        className={
                          d.isProcessed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
