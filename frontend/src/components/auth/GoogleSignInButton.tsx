import { useEffect, useRef } from 'react';

// Minimal typings for the Google Identity Services global.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string }
          ) => void;
        };
      };
    };
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

let scriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

/**
 * "Sign in with Google" button. Renders only when VITE_GOOGLE_CLIENT_ID is set.
 * Produces a Google ID token which the caller exchanges with the backend.
 */
export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
      })
      .catch(() => {
        /* network/script error — button simply won't appear */
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  if (!CLIENT_ID) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}

/** Whether Google sign-in is configured (used to show divider/labels). */
export const googleSignInEnabled = Boolean(CLIENT_ID);
