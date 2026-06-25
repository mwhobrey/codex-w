'use client';

import { diceSetRepo } from '@codex/sync';
import type { DiceSet } from '@codex/schemas';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOwnerId } from '@/hooks/use-owner-id';

export function useDiceSets(): { sets: DiceSet[] | undefined; ownerId: string; ready: boolean } {
  const { ownerId, ready } = useOwnerId();
  const sets = useLiveQuery(
    () => (ready ? diceSetRepo.listByOwner(ownerId) : []),
    [ownerId, ready],
  );

  return { sets, ownerId, ready };
}

export function createEmptyDiceSet(ownerId: string, name: string): DiceSet {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ownerId,
    name,
    formulas: [{ label: 'd20', notation: 'd20' }],
    createdAt: now,
    updatedAt: now,
  };
}
