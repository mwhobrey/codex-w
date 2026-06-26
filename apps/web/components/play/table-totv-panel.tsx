'use client';

import { advancePromptIndex } from '@codex/game-engine';
import {
  buildTyovPromptGuidance,
  clearTyovSlot,
  getGameSystem,
  getTyovCapacity,
  seedTyovSlotFromPrompt,
} from '@codex/game-systems';
import { Badge, Button, Card, CardHeader, CardTitle, Input } from '@codex/ui';
import { useCallback, useEffect, useState } from 'react';
import { patchGameState, readGameStateNumber, saveGameStateIndex, type TablePanelProps } from './table-panel-types';
import { TableSection } from './table-section';

export function TableTotvPanel({
  gameSystemId,
  meta,
  onUpdateMeta,
  onAppendLog,
  activeCharacter,
  logAuthor = 'You',
  onPatchCharacter,
  onOpenCharacterPeek,
}: TablePanelProps) {
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const prompts = engine?.prompts ?? [];

  const [sceneFocus, setSceneFocus] = useState(meta.sceneFocus ?? '');
  const [promptIndex, setPromptIndex] = useState(() =>
    readGameStateNumber(meta, 'promptIndex', 1),
  );
  const [jumpPrompt, setJumpPrompt] = useState('');
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const scenePromptIndex = readGameStateNumber(meta, 'scenePromptIndex', 0);

  useEffect(() => {
    setSceneFocus(meta.sceneFocus ?? '');
    setPromptIndex(readGameStateNumber(meta, 'promptIndex', 1));
  }, [meta.sceneFocus, meta.gameState]);

  const currentPrompt = prompts.find((p) => p.id === promptIndex) ?? prompts[0];
  const capacity = getTyovCapacity(activeCharacter ?? null);
  const guidance = currentPrompt
    ? buildTyovPromptGuidance(currentPrompt, activeCharacter ?? null)
    : null;

  const savePromptIndex = useCallback(
    (next: number) => {
      setPromptIndex(next);
      onUpdateMeta({ gameState: patchGameState(meta, { promptIndex: next }) });
    },
    [meta, onUpdateMeta],
  );

  const handleSceneBlur = useCallback(() => {
    if (sceneFocus !== (meta.sceneFocus ?? '')) {
      onUpdateMeta({ sceneFocus });
    }
  }, [meta.sceneFocus, onUpdateMeta, sceneFocus]);

  const handleAdvancePrompt = useCallback(() => {
    if (!engine?.promptAdvance) return;
    setRolling(true);
    setRollReveal(null);
    window.setTimeout(() => {
      const { minPrompt, maxPrompt } = engine.promptAdvance!;
      const result = advancePromptIndex(promptIndex, minPrompt, maxPrompt);
      savePromptIndex(result.next);
      const text = `d10 (${result.d10}) − d6 (${result.d6}) = ${result.delta >= 0 ? '+' : ''}${result.delta} → prompt ${result.next}`;
      setRollReveal(text);
      onAppendLog({ type: 'oracle', content: text, author: logAuthor });
      setRolling(false);
    }, 480);
  }, [engine?.promptAdvance, onAppendLog, promptIndex, savePromptIndex]);

  const handleDeclinePrompt = useCallback(() => {
    if (!currentPrompt || !engine?.promptAdvance) return;
    const { minPrompt, maxPrompt } = engine.promptAdvance;
    const result = advancePromptIndex(promptIndex, minPrompt, maxPrompt);
    savePromptIndex(result.next);
    onAppendLog({
      type: 'note',
      content: `Declined prompt ${currentPrompt.id} — moved on without writing.`,
      author: logAuthor,
    });
    setRollReveal(`Declined · navigation → prompt ${result.next}`);
  }, [currentPrompt, engine?.promptAdvance, onAppendLog, promptIndex, savePromptIndex]);

  const handleTakePrompt = useCallback(async () => {
    if (!currentPrompt) return;
    const prefix = activeCharacter ? `[${activeCharacter.name}] ` : '';
    onAppendLog({
      type: 'scene',
      content: `${prefix}Prompt ${currentPrompt.id}: ${currentPrompt.text}`,
      author: logAuthor,
    });

    if (!guidance || !onPatchCharacter || !activeCharacter) {
      onOpenCharacterPeek?.(guidance?.suggestedFieldKey);
      return;
    }

    if (guidance.action === 'gain' && guidance.suggestedFieldKey && !guidance.blocked) {
      await onPatchCharacter((sheet) =>
        seedTyovSlotFromPrompt(sheet, guidance.suggestedFieldKey!, currentPrompt),
      );
    } else if (guidance.action === 'loss' && guidance.suggestedFieldKey && !guidance.blocked) {
      await onPatchCharacter((sheet) => clearTyovSlot(sheet, guidance.suggestedFieldKey!));
    }

    onOpenCharacterPeek?.(guidance.suggestedFieldKey);
  }, [
    activeCharacter,
    currentPrompt,
    guidance,
    logAuthor,
    onAppendLog,
    onOpenCharacterPeek,
    onPatchCharacter,
  ]);

  const handleJumpPrompt = useCallback(() => {
    if (!engine?.promptAdvance) return;
    const n = Number.parseInt(jumpPrompt, 10);
    if (Number.isNaN(n)) return;
    const { minPrompt, maxPrompt } = engine.promptAdvance;
    const clamped = Math.max(minPrompt, Math.min(maxPrompt, n));
    savePromptIndex(clamped);
    setJumpPrompt('');
    onAppendLog({ type: 'note', content: `Jumped to prompt ${clamped}`, author: logAuthor });
  }, [engine?.promptAdvance, jumpPrompt, onAppendLog, savePromptIndex]);

  const handleScenePrompt = useCallback(() => {
    if (!engine) return;
    const prompt = engine.scenePrompts[scenePromptIndex % engine.scenePrompts.length]!;
    saveGameStateIndex(meta, onUpdateMeta, 'scenePromptIndex', scenePromptIndex + 1);
    onAppendLog({ type: 'scene', content: prompt, author: logAuthor });
  }, [engine, logAuthor, meta, onAppendLog, onUpdateMeta, scenePromptIndex]);

  if (!engine || engine.kind !== 'prompt-journal') return null;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80" data-testid="table-totv-panel">
      <CardHeader className="border-b border-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name} · Journal</CardTitle>
      </CardHeader>

      <TableSection title="Era">
        <Input
          value={sceneFocus}
          onChange={(e) => setSceneFocus(e.target.value)}
          onBlur={handleSceneBlur}
          placeholder="Where in your long life are you now?"
          className="text-sm"
        />
        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleScenePrompt}>
          Draw a scene prompt →
        </Button>
      </TableSection>

      <TableSection title={`Prompt ${currentPrompt?.id ?? '—'}`} description="Roll d10 − d6 to wander the journal">
        {currentPrompt?.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {currentPrompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs uppercase">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <p className="text-sm leading-relaxed text-foreground">{currentPrompt?.text}</p>
        {currentPrompt?.hint ? (
          <p className="text-xs text-muted-foreground">Sheet hint: {currentPrompt.hint}</p>
        ) : null}
        {capacity ? (
          <p className="text-xs text-muted-foreground">
            Slots — memories {capacity.memories.filled}/{capacity.memories.max} · skills{' '}
            {capacity.skills.filled}/{capacity.skills.max}
          </p>
        ) : null}
        {guidance ? (
          <p
            className={`text-xs ${guidance.blocked ? 'text-warning' : 'text-primary'}`}
            data-testid="totv-prompt-guidance"
          >
            {guidance.summary}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={handleAdvancePrompt} disabled={rolling}>
            {rolling ? 'Rolling…' : 'Advance (d10 − d6)'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void handleTakePrompt()}
            data-testid="totv-take-prompt"
          >
            Take prompt
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleDeclinePrompt}>
            Decline
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="number"
            min={1}
            max={engine.promptAdvance?.maxPrompt}
            value={jumpPrompt}
            onChange={(e) => setJumpPrompt(e.target.value)}
            placeholder="Prompt #"
            className="h-8 w-24 text-sm"
          />
          <Button type="button" size="sm" variant="secondary" onClick={handleJumpPrompt}>
            Go
          </Button>
        </div>
        <div className="min-h-10 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs" aria-live="polite">
          {rollReveal ?? <span className="text-muted-foreground">Navigation roll appears here.</span>}
        </div>
      </TableSection>
    </Card>
  );
}
