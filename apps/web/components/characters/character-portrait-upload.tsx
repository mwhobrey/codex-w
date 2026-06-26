'use client';

import type { CharacterSheet } from '@codex/schemas';
import { characterPortraitRepo } from '@codex/sync';
import { Button } from '@codex/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { uploadPortraitFile } from '@/lib/portrait-cloud-sync';

interface CharacterPortraitUploadProps {
  sheet: CharacterSheet;
  onSave: (sheet: CharacterSheet) => void | Promise<void>;
}

export function CharacterPortraitUpload({ sheet, onSave }: CharacterPortraitUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localPreview = useLiveQuery(
    () => characterPortraitRepo.getObjectUrl(sheet.id),
    [sheet.id],
  );

  const displayUrl = sheet.portraitUrl ?? localPreview ?? undefined;

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      await characterPortraitRepo.save(sheet.id, file);

      let next: CharacterSheet = {
        ...sheet,
        portraitUrl: undefined,
        updatedAt: new Date().toISOString(),
      };

      try {
        const cloudUrl = await uploadPortraitFile(file);
        if (cloudUrl) {
          next = { ...next, portraitUrl: cloudUrl };
        }
      } catch (cloudError) {
        setError(
          cloudError instanceof Error
            ? `${cloudError.message} — saved on this device only.`
            : 'Cloud upload failed — saved on this device only.',
        );
      }

      await onSave(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    await characterPortraitRepo.delete(sheet.id);
    const next = {
      ...sheet,
      portraitUrl: undefined,
      updatedAt: new Date().toISOString(),
    };
    await onSave(next);
  };

  return (
    <div className="flex flex-col items-center gap-2" data-testid="character-portrait-upload">
      <button
        type="button"
        className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-background/60 transition-colors hover:border-primary/50"
        onClick={() => inputRef.current?.click()}
        title="Upload portrait"
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt=""
            className="h-full w-full object-cover"
            data-testid="character-portrait-preview"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Portrait
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        aria-label="Choose portrait image"
        data-testid="character-portrait-input"
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
          {uploading ? 'Saving…' : displayUrl ? 'Change' : 'Add portrait'}
        </Button>
        {displayUrl ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => void remove()}
          >
            Remove
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="max-w-[12rem] text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <p className="max-w-[12rem] text-center text-xs text-muted-foreground/60">
        Stored on this device. Sign in to back up portrait URL to the cloud.
      </p>
    </div>
  );
}
