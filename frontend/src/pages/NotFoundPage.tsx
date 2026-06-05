import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-900">Сторінку не знайдено</h1>
      <p className="mt-1 text-sm text-slate-500">
        Можливо, її було переміщено або видалено.
      </p>
      <Link to="/" className="btn-primary mt-6">
        На головну
      </Link>
    </div>
  );
}
