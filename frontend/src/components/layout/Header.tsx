import { useAuth } from '@/contexts/AuthContext';
import { LogoutIcon, ShieldIcon } from '@/components/ui/Icons';

const roleLabels: Record<string, string> = {
  Admin: 'Адміністратор',
  OrganizationRep: 'Представник організації',
};

export function Header() {
  const { user, logout } = useAuth();

  const initials = (user?.displayName ?? '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <ShieldIcon className="h-4 w-4" />
        </div>
        <span className="font-extrabold text-slate-900">Donatly</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-900">
              {user?.displayName}
            </p>
            <p className="text-xs text-slate-400">
              {user ? roleLabels[user.userType] ?? user.userType : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="btn-ghost"
          title="Вийти"
        >
          <LogoutIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Вийти</span>
        </button>
      </div>
    </header>
  );
}
