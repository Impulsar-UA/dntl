import { useEffect, useMemo, useState } from 'react';
import type { User, UserType } from '@/types';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

type RoleFilter = 'all' | UserType;

const roleLabels: Record<string, string> = {
  Admin: 'Адміністратор',
  OrganizationRep: 'Представник організації',
  Donor: 'Благодійник',
  User: 'Користувач',
};

const roleClasses: Record<string, string> = {
  Admin: 'bg-brand-100 text-brand-800',
  OrganizationRep: 'bg-blue-100 text-blue-700',
  Donor: 'bg-emerald-100 text-emerald-800',
  User: 'bg-slate-100 text-slate-700',
};

const FILTERS: RoleFilter[] = ['all', 'Admin', 'OrganizationRep', 'Donor'];

export default function UserManagementPage() {
  const { user: current } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await authApi.listUsers());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити користувачів.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? users : users.filter((u) => u.userType === filter)),
    [users, filter]
  );

  async function toggleActive(u: User) {
    setBusyId(u.id);
    setError(null);
    try {
      const updated = await authApi.setUserActive(u.id, !u.isActive);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося змінити статус.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Користувачі"
        subtitle="Керування обліковими записами платформи"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Усі' : roleLabels[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner className="py-24" label="Завантаження користувачів…" />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-slate-500">Немає користувачів за цим фільтром.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ім'я / Організація</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Роль</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 text-right font-semibold">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const isSelf = u.id === current?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {u.displayName}
                        {isSelf && (
                          <span className="ml-2 text-xs text-slate-400">(ви)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge
                          label={roleLabels[u.userType] ?? u.userType}
                          className={roleClasses[u.userType] ?? roleClasses.User}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={u.isActive ? 'Активний' : 'Заблокований'}
                          className={
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-700'
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <button
                            type="button"
                            className={u.isActive ? 'btn-danger' : 'btn-primary'}
                            disabled={busyId === u.id}
                            onClick={() => toggleActive(u)}
                          >
                            {busyId === u.id
                              ? 'Зачекайте…'
                              : u.isActive
                                ? 'Заблокувати'
                                : 'Розблокувати'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
