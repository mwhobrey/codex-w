'use client';

import { lookupTable, resolveForgeRoll, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import { getGameSystem, getSheetFieldValue } from '@codex/game-systems';
import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@codex/ui';
import { useCallback, useEffect, useState } from 'react';
import { patchGameState, readGameStateNumber, type TablePanelProps } from './table-panel-types';
import { TableSection } from './table-section';

export function TableIronforgePanel({
  gameSystemId,
  meta,
  onUpdateMeta,
  onAppendLog,
  activeCharacter,
  logAuthor = 'You',
}: TablePanelProps) {
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const vowConfig = engine?.vowProgress;

  const [sceneFocus, setSceneFocus] = useState(meta.sceneFocus ?? '');
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [difficulty, setDifficulty] = useState('dangerous');
  const [scenePromptIndex, setScenePromptIndex] = useState(0);

  const vowProgress = readGameStateNumber(meta, 'vowProgress', 0);
  const progressMax = vowConfig?.progressMax ?? 10;
  const grit = Number(activeCharacter?.fields.find((f) => f.key === 'grit')?.value ?? 1);
  const oath = activeCharacter ? getSheetFieldValue(activeCharacter, 'iron_oath') : '';

  useEffect(() => {
    setSceneFocus(meta.sceneFocus ?? '');
  }, [meta.sceneFocus]);

  const handleSceneBlur = useCallback(() => {
    if (sceneFocus !== (meta.sceneFocus ?? '')) onUpdateMeta({ sceneFocus });
  }, [meta.sceneFocus, onUpdateMeta, sceneFocus]);

  const saveVowProgress = useCallback(
    (next: number) => {
      onUpdateMeta({ gameState: patchGameState(meta, { vowProgress: next }) });
    },
    [meta, onUpdateMeta],
  );

  const handleForgeRoll = useCallback(() => {
    if (!vowConfig) return;
    const diff = vowConfig.difficulties.find((d) => d.id === difficulty) ?? vowConfig.difficulties[1]!;
    setRolling(true);
    setRollReveal(null);
    window.setTimeout(() => {
      const result = resolveForgeRoll(grit, diff.target);
      let text = `Forge (${diff.label} ${diff.target}): [${result.dice.join(', ')}] + ${result.modifier} = ${result.total} → ${result.outcome.toUpperCase()}`;

      if (result.outcome === 'miss' && vowConfig.complicationTable.length) {
        const die = rollDiceNotation(`1d${tableMaxRoll(vowConfig.complicationTable)}`).groups[0]?.rolls[0]?.value ?? 1;
        const comp = lookupTable(vowConfig.complicationTable, die);
        text += ` · ${comp.entry}`;
        onAppendLog({ type: 'twist', content: comp.entry, author: logAuthor });
      } else if (result.progressGain > 0) {
        const next = Math.min(progressMax, vowProgress + result.progressGain);
        saveVowProgress(next);
        text += ` · +${result.progressGain} progress (${next}/${progressMax})`;
      }

      setRollReveal(text);
      onAppendLog({ type: 'risk', content: text, author: logAuthor });
      setRolling(false);
    }, 520);
  }, [difficulty, grit, onAppendLog, progressMax, saveVowProgress, vowConfig, vowProgress]);

  const handleHazard = useCallback(() => {
    if (!vowConfig?.hazardTable.length) return;
    const die = rollDiceNotation(`1d${tableMaxRoll(vowConfig.hazardTable)}`).groups[0]?.rolls[0]?.value ?? 1;
    const hazard = lookupTable(vowConfig.hazardTable, die);
    const text = `Hazard (${die}): ${hazard.entry}`;
    setRollReveal(text);
    onAppendLog({ type: 'scene', content: text, author: logAuthor });
  }, [onAppendLog, vowConfig?.hazardTable]);

  const handleScenePrompt = useCallback(() => {
    if (!engine) return;
    const prompt = engine.scenePrompts[scenePromptIndex % engine.scenePrompts.length]!;
    setScenePromptIndex((i) => i + 1);
    onAppendLog({ type: 'scene', content: prompt, author: logAuthor });
  }, [engine, onAppendLog, scenePromptIndex]);

  const handleResetVow = useCallback(() => {
    saveVowProgress(0);
    onAppendLog({ type: 'note', content: 'Oath track reset — swear anew.', author: logAuthor });
  }, [onAppendLog, saveVowProgress]);

  if (!engine || engine.kind !== 'vow-progress' || !vowConfig) return null;

  return (
    <Card className="overflow-hidden border-codex-border/60 bg-codex-surface/80" data-testid="table-ironforge-panel">
      <CardHeader className="border-b border-codex-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name} · Oath</CardTitle>
        <CardDescription className="text-xs">{oath || 'Link a character with an oath on their sheet.'}</CardDescription>
      </CardHeader>

      <TableSection title="Shift">
        <Input
          value={sceneFocus}
          onChange={(e) => setSceneFocus(e.target.value)}
          onBlur={handleSceneBlur}
          placeholder="What beat of the grind are you in?"
          className="text-sm"
        />
        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleScenePrompt}>
          Draw a scene prompt →
        </Button>
      </TableSection>

      <TableSection title="Iron oath">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: progressMax }, (_, i) => (
            <span
              key={i}
              className={`h-3 w-6 rounded-sm border ${
                i < vowProgress ? 'border-codex-ember bg-codex-ember' : 'border-codex-border bg-codex-void/40'
              }`}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-xs text-codex-text-muted">
          Progress {vowProgress}/{progressMax}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {vowConfig.difficulties.map((d) => (
            <Button
              key={d.id}
              type="button"
              size="sm"
              variant={difficulty === d.id ? 'default' : 'outline'}
              onClick={() => setDifficulty(d.id)}
            >
              {d.label} ({d.target})
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={handleForgeRoll} disabled={rolling}>
            {rolling ? 'Rolling…' : `Roll 2d6 + grit (${grit})`}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleHazard}>
            Hazard
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleResetVow}>
            Reset
          </Button>
        </div>
        <div className="min-h-10 rounded-md border border-codex-border/40 bg-codex-void/40 px-3 py-2 text-xs" aria-live="polite">
          {rollReveal ?? <span className="text-codex-text-muted">Forge results appear here.</span>}
        </div>
      </TableSection>
    </Card>
  );
}
