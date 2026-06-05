import { useCallback, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/api/client';
import { Alert } from '@/components/ui/Alert';
import { HeartIcon } from '@/components/ui/Icons';
import { GoogleSignInButton, googleSignInEnabled } from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Невідома помилка під час входу.');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogle = useCallback(
    async (idToken: string) => {
      setError(null);
      try {
        await loginWithGoogle(idToken);
        navigate(from, { replace: true });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Помилка входу через Google.');
      }
    },
    [loginWithGoogle, navigate, from]
  );

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-white">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <HeartIcon className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Donatly</h1>
          <p className="mt-1 text-sm text-brand-100">Цифрова платформа благодійності</p>
        </div>

        <div className="card p-8">
          <h2 className="mb-1 text-xl font-bold text-slate-900">Вхід до системи</h2>
          <p className="mb-6 text-sm text-slate-500">
            Донори, представники організацій та адміністратори
          </p>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Електронна пошта
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Вхід…' : 'Увійти'}
            </button>
          </form>

          {googleSignInEnabled && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">або</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <GoogleSignInButton onCredential={handleGoogle} />
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Немає акаунту?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Зареєструватися
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-brand-100">
          Демо-доступ: donor@donatly.com / password · org@donatly.com / password
        </p>
      </div>
    </div>
  );
}
