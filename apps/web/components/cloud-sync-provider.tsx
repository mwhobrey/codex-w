'use client';

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
    void pullCloudData(userId);
  }, [isPending, session?.user?.id]);

  return children;
}
