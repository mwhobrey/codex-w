'use client';

import { Button, Input } from '@codex/ui';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { readGameStateNumber, saveGameStateIndex, type TablePanelProps } from './table-panel-types';
import { TableSection } from './table-section';

interface SceneFocusSectionProps
  extends Pick<TablePanelProps, 'meta' | 'onUpdateMeta' | 'onAppendLog' | 'logAuthor'> {
  title?: string;
  placeholder: string;
  /** Canned scene prompts to draw from, if this system has any. */
  scenePrompts?: string[];
  /** Extra content rendered inside the same section, below the prompt draw/reveal. */
  children?: ReactNode;
}

/**
 * Scene focus input + "draw a scene prompt" — shared across every system
 * panel. Has an explicit Save button (matching every other composer in the
 * app — Post note, Roll, etc.) rather than relying on blur alone, which
 * read as broken since there was no visible way to confirm the action.
 * Also reveals the drawn prompt inline instead of only posting it to the
 * log, which required switching to the Session tab to see it landed at all.
 */
export function SceneFocusSection({
  title = 'Scene',
  placeholder,
  meta,
  onUpdateMeta,
  onAppendLog,
  logAuthor = 'You',
  scenePrompts,
  children,
}: SceneFocusSectionProps) {
  const [sceneFocus, setSceneFocus] = useState(meta.sceneFocus ?? '');
  const [sceneReveal, setSceneReveal] = useState<string | null>(null);
  const [sceneSaved, setSceneSaved] = useState(false);
  const scenePromptIndex = readGameStateNumber(meta, 'scenePromptIndex', 0);
  const isDirty = sceneFocus.trim() !== (meta.sceneFocus ?? '');

  useEffect(() => {
    setSceneFocus(meta.sceneFocus ?? '');
  }, [meta.sceneFocus]);

  const handleSceneSave = useCallback(() => {
    const trimmed = sceneFocus.trim();
    if (trimmed === (meta.sceneFocus ?? '')) return;
    onUpdateMeta({ sceneFocus: trimmed || undefined });
    if (trimmed) {
      onAppendLog({ type: 'scene', content: trimmed, author: logAuthor });
      setSceneReveal(trimmed);
    }
    setSceneSaved(true);
    window.setTimeout(() => setSceneSaved(false), 1500);
  }, [logAuthor, meta.sceneFocus, onAppendLog, onUpdateMeta, sceneFocus]);

  const handleScenePrompt = useCallback(() => {
    if (!scenePrompts?.length) return;
    const prompt = scenePrompts[scenePromptIndex % scenePrompts.length]!;
    saveGameStateIndex(meta, onUpdateMeta, 'scenePromptIndex', scenePromptIndex + 1);
    setSceneReveal(prompt);
    onAppendLog({ type: 'scene', content: prompt, author: logAuthor });
  }, [logAuthor, meta, onAppendLog, onUpdateMeta, scenePromptIndex, scenePrompts]);

  return (
    <TableSection title={title}>
      <div>
        <div className="flex gap-2">
          <Input
            value={sceneFocus}
            onChange={(e) => setSceneFocus(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSceneSave();
              }
            }}
            placeholder={placeholder}
            className="text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={handleSceneSave}
            disabled={!isDirty}
          >
            Save
          </Button>
        </div>
        <p className="mt-1 h-4 text-xs text-primary" aria-live="polite">
          {sceneSaved ? 'Saved ✓' : ''}
        </p>
      </div>

      {scenePrompts?.length ? (
        <>
          <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleScenePrompt}>
            Draw a scene prompt →
          </Button>
          <div
            className="min-h-10 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs"
            aria-live="polite"
          >
            {sceneReveal ?? (
              <span className="text-muted-foreground">Prompt appears here and in the log.</span>
            )}
          </div>
        </>
      ) : null}

      {children}
    </TableSection>
  );
}
