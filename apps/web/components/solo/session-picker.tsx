'use client';

import { soloSessionRepo } from '@codex/sync';
import type { GameSystemId, SoloSession } from '@codex/schemas';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from '@codex/ui';
import { queueSessionSync } from '@/lib/session-sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';

function createId(): string {
  return crypto.randomUUID();
}

function defaultSessionName(count: number): string {
  return `Session ${count + 1}`;
}

function sessionLabel(session: SoloSession): string {
  return session.name ?? 'Unnamed session';
}

interface SessionPickerProps {
  ownerId: string;
  gameSystemId: GameSystemId;
  activeSessionId: string | undefined;
  onSessionChange: (sessionId: string) => void;
}

export function SessionPicker({
  ownerId,
  gameSystemId,
  activeSessionId,
  onSessionChange,
}: SessionPickerProps) {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SoloSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sessions = useLiveQuery(
    () =>
      ownerId ? soloSessionRepo.listByOwnerAndSystem(ownerId, gameSystemId) : Promise.resolve(undefined),
    [ownerId, gameSystemId],
  );

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const now = new Date().toISOString();
      const trimmed = newName.trim();
      const created: SoloSession = {
        id: createId(),
        gameSystemId,
        ownerId,
        name: trimmed || defaultSessionName(sessions?.length ?? 0),
        createdAt: now,
        updatedAt: now,
      };
      await soloSessionRepo.save(created);
      void queueSessionSync(created);
      setNewName('');
      onSessionChange(created.id);
    } finally {
      setCreating(false);
    }
  }, [gameSystemId, newName, onSessionChange, ownerId, sessions?.length]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const deletedId = pendingDelete.id;
      await soloSessionRepo.delete(deletedId);
      if (activeSessionId === deletedId) {
        const remaining = (sessions ?? []).filter((s) => s.id !== deletedId);
        if (remaining.length > 0) {
          onSessionChange(remaining[0]!.id);
        } else {
          const now = new Date().toISOString();
          const created: SoloSession = {
            id: createId(),
            gameSystemId,
            ownerId,
            name: defaultSessionName(0),
            createdAt: now,
            updatedAt: now,
          };
          await soloSessionRepo.save(created);
          onSessionChange(created.id);
        }
      }
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }, [activeSessionId, gameSystemId, onSessionChange, ownerId, pendingDelete, sessions]);

  const activeSession = sessions?.find((s) => s.id === activeSessionId);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            Sessions
          </CardTitle>
          <CardDescription>
            {activeSession
              ? `Playing: ${sessionLabel(activeSession)}`
              : 'Select or create a session'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(sessions?.length ?? 0) > 0 && (
            <div>
              <Label htmlFor="session-select" className="mb-2 block text-xs uppercase tracking-wide">
                Active session
              </Label>
              <Select
                id="session-select"
                value={activeSessionId ?? ''}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) onSessionChange(id);
                }}
              >
                {(sessions ?? []).map((session) => (
                  <option key={session.id} value={session.id}>
                    {sessionLabel(session)}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="new-session-name" className="mb-2 block text-xs uppercase tracking-wide">
              New session
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-session-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={defaultSessionName(sessions?.length ?? 0)}
                maxLength={128}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleCreate();
                }}
              />
              <Button type="button" variant="secondary" onClick={handleCreate} disabled={creating}>
                {creating ? '…' : 'Create'}
              </Button>
            </div>
          </div>

          {activeSessionId && (sessions?.length ?? 0) > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => {
                const session = sessions?.find((s) => s.id === activeSessionId);
                if (session) setPendingDelete(session);
              }}
            >
              Delete session
            </Button>
          )}
        </CardContent>
      </Card>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <Card
            role="alertdialog"
            aria-labelledby="delete-session-title"
            aria-describedby="delete-session-desc"
            className="w-full max-w-sm shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle id="delete-session-title">Delete session?</CardTitle>
              <CardDescription id="delete-session-desc">
                &ldquo;{sessionLabel(pendingDelete)}&rdquo; and its journal entries will be
                permanently removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void handleDeleteConfirm()}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export { defaultSessionName, createId as createSessionId };
