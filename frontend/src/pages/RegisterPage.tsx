import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/api/client';
import { Alert } from '@/components/ui/Alert';
import { HeartIcon, ShieldIcon, InitiativeIcon } from '@/components/ui/Icons';
import type { RegistrableRole } from '@/types';

export default function RegisterPage() {
  const { registerOrgRep, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<RegistrableRole>('OrganizationRep');
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgRegistryCode: '',
    contactPhone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Паролі не співпадають.');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль має містити щонайменше 6 символів.');
      return;
    }

    setLoading(true);
    try {
      if (role === 'Admin') {
        await registerAdmin({
          displayName: form.displayName,
          email: form.email,
          password: form.password,
        });
      } else {
        await registerOrgRep({
          displayName: form.displayName,
          email: form.email,
          password: form.password,
          orgRegistryCode: form.orgRegistryCode,
          contactPhone: form.contactPhone,
        });
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Невідома помилка під час реєстрації.'
      );
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = role === 'Admin';

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center text-white">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <HeartIcon className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Donatly</h1>
          <p className="mt-1 text-sm text-brand-100">Реєстрація облікового запису</p>
        </div>

        <div className="card p-8">
          <h2 className="mb-1 text-xl font-bold text-slate-900">Створення акаунту</h2>
          <p className="mb-5 text-sm text-slate-500">Оберіть роль та заповніть дані</p>

          {/* Role selector */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('OrganizationRep')}
              className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition ${
                !isAdmin
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <InitiativeIcon
                className={`h-6 w-6 ${!isAdmin ? 'text-brand-600' : 'text-slate-400'}`}
              />
              <span className="text-sm font-semibold text-slate-900">
                Представник організації
              </span>
              <span className="text-xs text-slate-500">
                Створення та ведення благодійних зборів
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('Admin')}
              className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition ${
                isAdmin
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <ShieldIcon
                className={`h-6 w-6 ${isAdmin ? 'text-brand-600' : 'text-slate-400'}`}
              />
              <span className="text-sm font-semibold text-slate-900">Адміністратор</span>
              <span className="text-xs text-slate-500">
                Модерація, аналітика та керування
              </span>
            </button>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="displayName">
                {isAdmin ? 'Ім’я адміністратора' : 'Назва організації'}
              </label>
              <input
                id="displayName"
                className="input"
                placeholder={isAdmin ? 'Олександр Адмін' : 'Благодійний фонд «Імпульс»'}
                value={form.displayName}
                onChange={(e) => update('displayName', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Електронна пошта
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="input"
                placeholder={isAdmin ? 'admin@donatly.com' : 'org@organization.com'}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>

            {/* Organization-only fields */}
            {!isAdmin && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="orgRegistryCode">
                    Код ЄДРПОУ
                  </label>
                  <input
                    id="orgRegistryCode"
                    className="input"
                    placeholder="12345678"
                    value={form.orgRegistryCode}
                    onChange={(e) => update('orgRegistryCode', e.target.value)}
                    required={!isAdmin}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="contactPhone">
                    Контактний телефон
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    className="input"
                    placeholder="+380501112233"
                    value={form.contactPhone}
                    onChange={(e) => update('contactPhone', e.target.value)}
                    required={!isAdmin}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">
                  Підтвердження паролю
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading
                ? 'Реєстрація…'
                : isAdmin
                  ? 'Зареєструватися як адміністратор'
                  : 'Зареєструватися як організація'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Вже маєте акаунт?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
