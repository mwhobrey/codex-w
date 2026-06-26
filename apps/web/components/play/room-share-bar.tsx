'use client';

import { Button, Input, Label } from '@codex/ui';
import { useCallback, useState } from 'react';

interface RoomShareBarProps {
  roomUrl: string;
}

export function RoomShareBar({ roomUrl }: RoomShareBarProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [roomUrl]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Label htmlFor="room-link" className="text-xs text-muted-foreground">
          Invite link
        </Label>
        <Input
          id="room-link"
          readOnly
          value={roomUrl}
          className="mt-1 font-mono text-xs"
          onFocus={(event) => event.target.select()}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={copyLink} className="shrink-0">
        {copied ? 'Copied!' : 'Copy link'}
      </Button>
    </div>
  );
}
