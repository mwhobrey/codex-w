'use client';

import type { CharacterSheet } from '@codex/schemas';
import { Button } from '@codex/ui';
import { useRef, useState } from 'react';

interface CharacterPortraitUploadProps {
  sheet: CharacterSheet;
  onSave: (sheet: CharacterSheet) => void | Promise<void>;
}

export function CharacterPortraitUpload({ sheet, onSave }: CharacterPortraitUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const response = await fetch('/api/assets', { method: 'POST', body: formData });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? 'Upload failed');
      }
      await onSave({ ...sheet, portraitUrl: payload.url, updatedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2" data-testid="character-portrait-upload">
      <button
        type="button"
        className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-codex-border bg-codex-void/60 transition-colors hover:border-codex-ember/50"
        onClick={() => inputRef.current?.click()}
        title="Upload portrait"
      >
        {sheet.portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sheet.portraitUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-codex-text-muted">
            Portrait
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = '';
        }}
      />
      <div className="flex flex-wrap justify-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : sheet.portraitUrl ? 'Change' : 'Add portrait'}
        </Button>
        {sheet.portraitUrl ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-codex-text-muted"
            onClick={() => void onSave({ ...sheet, portraitUrl: undefined, updatedAt: new Date().toISOString() })}
          >
            Remove
          </Button>
        ) : null}
      </div>
      {error ? <p className="max-w-[12rem] text-center text-[10px] text-red-400">{error}</p> : null}
      <p className="max-w-[12rem] text-center text-[10px] text-codex-text-faint">
        Shown on your map token. Sign in to upload.
      </p>
    </div>
  );
}
