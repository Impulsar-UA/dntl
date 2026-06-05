import { useState } from 'react';
import type { Initiative } from '@/types';

interface ShareMenuProps {
  initiative: Initiative;
}

/**
 * Social media sharing (MF-15). Builds share URLs for Facebook, X and Threads.
 * Uses the public catalogue URL of the initiative (mobile/web deep link stub).
 */
export function ShareMenu({ initiative }: ShareMenuProps) {
  const [open, setOpen] = useState(false);

  const shareUrl = `${window.location.origin}/initiatives/${initiative.id}`;
  const text = `Підтримайте збір «${initiative.title}» на Donatly`;

  const targets: { label: string; href: string }[] = [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(text)}`,
    },
    {
      label: 'Threads',
      href: `https://www.threads.net/intent/post?text=${encodeURIComponent(
        `${text} ${shareUrl}`
      )}`,
    },
  ];

  return (
    <div className="relative">
      <button type="button" className="btn-secondary" onClick={() => setOpen((v) => !v)}>
        Поділитися
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {targets.map((t) => (
              <a
                key={t.label}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {t.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
