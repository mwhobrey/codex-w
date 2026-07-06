'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'codex-beta-banner-dismissed';

export function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(STORAGE_KEY) !== '1') {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="flex items-center justify-center gap-3 border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-xs text-warning">
      <p className="text-center leading-snug">
        Early beta — this is a personal test environment. Data may be reset or moved without notice.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss beta notice"
        className="shrink-0 rounded p-0.5 text-warning/70 hover:bg-warning/15 hover:text-warning"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
