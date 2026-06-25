'use client';

import { useSession } from '@/lib/auth-client';
import { getLocalOwnerId } from '@/lib/local-owner';
import { useEffect, useState } from 'react';

export interface OwnerIdState {
  ownerId: string;
  /** False while auth session or local owner id is still resolving. */
  ready: boolean;
}

/** Authenticated user id when signed in; anonymous local id otherwise. */
export function useOwnerId(): OwnerIdState {
  const { data: session, isPending } = useSession();
  const [localId, setLocalId] = useState<string | null>(null);

  useEffect(() => {
    setLocalId(getLocalOwnerId());
  }, []);

  const ready = !isPending && localId !== null;
  const ownerId = session?.user?.id ?? localId ?? '';

  return { ownerId, ready };
}
