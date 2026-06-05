import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DashboardIcon,
  HeartIcon,
  HistoryIcon,
  InitiativeIcon,
  PetitionIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
} from '@/components/ui/Icons';
import type { ComponentType, SVGProps } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end: boolean;
}

const adminNav: NavItem[] = [
  { to: '/', label: 'Огляд', icon: DashboardIcon, end: true },
  { to: '/moderation', label: 'Модерація зборів', icon: ShieldIcon, end: false },
  { to: '/petitions', label: 'Модерація петицій', icon: PetitionIcon, end: false },
  { to: '/users', label: 'Користувачі', icon: UsersIcon, end: false },
];

const orgRepNav: NavItem[] = [
  { to: '/', label: 'Огляд', icon: DashboardIcon, end: true },
  { to: '/initiatives', label: 'Мої збори', icon: InitiativeIcon, end: false },
];

const donorNav: NavItem[] = [
  { to: '/', label: 'Огляд', icon: DashboardIcon, end: true },
  { to: '/initiatives', label: 'Збори', icon: HeartIcon, end: false },
  { to: '/assistant', label: 'AI-помічник', icon: SparklesIcon, end: false },
  { to: '/petitions', label: 'Петиції', icon: PetitionIcon, end: false },
  { to: '/history', label: 'Історія донатів', icon: HistoryIcon, end: false },
];

export function Sidebar() {
  const { isAdmin, isDonor } = useAuth();
  const navItems = isAdmin ? adminNav : isDonor ? donorNav : orgRepNav;
  const roleLabel = isAdmin
    ? 'Адміністратор'
    : isDonor
      ? 'Благодійник'
      : 'Представник організації';
  const footer = isAdmin
    ? 'Модерація, аналітика та керування платформою.'
    : isDonor
      ? 'Підтримуйте збори та петиції, яким довіряєте.'
      : 'Створення та ведення власних благодійних зборів.';

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <HeartIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-extrabold leading-tight text-slate-900">Donatly</p>
          <p className="text-xs text-slate-400">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-xs leading-relaxed text-slate-400">{footer}</p>
      </div>
    </aside>
  );
}
