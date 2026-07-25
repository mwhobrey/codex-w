'use client';

import { flushCloudQueue } from '@codex/sync';
import { useSession } from '@/lib/auth-client';
import { pullCloudData } from '@/lib/cloud-sync';
import { useEffect, useRef } from 'react';

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const syncedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (isPending || !session?.user?.id) return;
    if (syncedForUser.current === session.user.id) return;

    const userId = session.user.id;
    syncedForUser.current = userId;
    void (async () => {
      await pullCloudData(userId);
      // Flush after pull so remote wins first, then push local pending.
      await flushCloudQueue();
    })();
  }, [isPending, session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const onOnline = () => {
      void flushCloudQueue();
    };
    window.addEventListener('online', onOnline);
    const interval = window.setInterval(() => {
      void flushCloudQueue();
    }, 60_000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(interval);
    };
  }, [session?.user?.id]);

  return children;
}
