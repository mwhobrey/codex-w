'use client';

import { lookupTable, resolveLasersFeelings, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import type { LasersFeelingsMode } from '@codex/game-engine';
import { getGameSystem, campWeekArcLabel, getSheetFieldValue, lookupCampTable } from '@codex/game-systems';
import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@codex/ui';
import { useCallback, useEffect, useState } from 'react';
import { patchGameState, readGameStateNumber, saveGameStateIndex, type TablePanelProps } from './table-panel-types';
import { TableSection } from './table-section';

export function TableSnallygasterPanel({
  gameSystemId,
  meta,
  onUpdateMeta,
  onAppendLog,
  activeCharacter,
  logAuthor = 'You',
}: TablePanelProps) {
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const lf = engine?.lasersFeelings;

  const [mode, setMode] = useState<LasersFeelingsMode>('counselor');
  const [sceneFocus, setSceneFocus] = useState(meta.sceneFocus ?? '');
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const scenePromptIndex = readGameStateNumber(meta, 'scenePromptIndex', 0);

  const campWeek = readGameStateNumber(meta, 'campWeek', 1);
  const counselorStat = Number(activeCharacter?.fields.find((f) => f.key === 'counselor_stat')?.value ?? 3);
  const monsterStat = Number(activeCharacter?.fields.find((f) => f.key === 'monster_stat')?.value ?? 3);
  const stat = mode === 'counselor' ? counselorStat : monsterStat;
  const fear = activeCharacter ? getSheetFieldValue(activeCharacter, 'fear') : '';

  useEffect(() => {
    setSceneFocus(meta.sceneFocus ?? '');
  }, [meta.sceneFocus]);

  const handleSceneBlur = useCallback(() => {
    if (sceneFocus !== (meta.sceneFocus ?? '')) onUpdateMeta({ sceneFocus });
  }, [meta.sceneFocus, onUpdateMeta, sceneFocus]);

  const setCampWeek = useCallback(
    (week: number) => {
      const clamped = Math.max(1, Math.min(8, week));
      onUpdateMeta({ gameState: patchGameState(meta, { campWeek: clamped }) });
      onAppendLog({ type: 'note', content: `Summer week ${clamped} of 8`, author: logAuthor });
    },
    [meta, onAppendLog, onUpdateMeta],
  );

  const handleRoll = useCallback(() => {
    if (!lf) return;
    setRolling(true);
    setRollReveal(null);
    window.setTimeout(() => {
      const result = resolveLasersFeelings(stat, mode);
      const label = mode === 'counselor' ? lf.counselorLabel : lf.monsterLabel;
      const text = `${label} (${stat}): [${result.dice.join(', ')}] → ${result.success ? 'SUCCESS' : 'FAIL'}`;
      setRollReveal(text);
      onAppendLog({ type: 'risk', content: text, author: logAuthor });
      setRolling(false);
    }, 520);
  }, [lf, mode, onAppendLog, stat]);

  const handleProblem = useCallback(() => {
    if (!lf) return;
    const max = tableMaxRoll(lf.problemTable);
    const rawDie = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
    const problem = lookupCampTable(lf.problemTable, rawDie, campWeek);
    const text = `Camp problem (w${campWeek}, rolled ${rawDie}→${problem.die}): ${problem.entry}`;
    setRollReveal(text);
    onAppendLog({ type: 'scene', content: text, author: logAuthor });
  }, [campWeek, lf, onAppendLog]);

  const handleActivity = useCallback(() => {
    if (!lf?.activityTable?.length) return;
    const max = tableMaxRoll(lf.activityTable);
    const rawDie = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
    const activity = lookupCampTable(lf.activityTable, rawDie, campWeek);
    const text = `Camp activity (w${campWeek}, rolled ${rawDie}→${activity.die}): ${activity.entry}`;
    setRollReveal(text);
    onAppendLog({ type: 'scene', content: text, author: logAuthor });
  }, [campWeek, lf?.activityTable, onAppendLog]);

  const handleTwist = useCallback(() => {
    if (!engine?.twistTable) return;
    const max = tableMaxRoll(engine.twistTable);
    const die = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
    const twist = lookupTable(engine.twistTable, die);
    const text = `Twist (${die}): ${twist.entry}`;
    setRollReveal(text);
    onAppendLog({ type: 'twist', content: text, author: logAuthor });
  }, [engine?.twistTable, onAppendLog]);

  const handleScenePrompt = useCallback(() => {
    if (!engine) return;
    const prompt = engine.scenePrompts[scenePromptIndex % engine.scenePrompts.length]!;
    saveGameStateIndex(meta, onUpdateMeta, 'scenePromptIndex', scenePromptIndex + 1);
    onAppendLog({ type: 'scene', content: prompt, author: logAuthor });
  }, [engine, logAuthor, meta, onAppendLog, onUpdateMeta, scenePromptIndex]);

  if (!engine || engine.kind !== 'lasers-feelings' || !lf) return null;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80" data-testid="table-snallygaster-panel">
      <CardHeader className="border-b border-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name} · Camp</CardTitle>
      </CardHeader>

      <TableSection title="Scene">
        <Input
          value={sceneFocus}
          onChange={(e) => setSceneFocus(e.target.value)}
          onBlur={handleSceneBlur}
          placeholder="What's happening at camp?"
          className="text-sm"
        />
        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleScenePrompt}>
          Draw a scene prompt →
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Summer week {campWeek}/8</span>
          <span className="text-[10px] text-muted-foreground/60">{campWeekArcLabel(campWeek)}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => setCampWeek(campWeek + 1)}>
            Next week
          </Button>
        </div>
      </TableSection>

      <TableSection title="Lasers & Feelings" description="Counselor: any die > stat. Monster: any die < stat.">
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={mode === 'counselor' ? 'default' : 'outline'}
            onClick={() => setMode('counselor')}
          >
            {lf.counselorLabel} ({counselorStat})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'monster' ? 'default' : 'outline'}
            onClick={() => setMode('monster')}
          >
            {lf.monsterLabel} ({monsterStat})
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={handleRoll} disabled={rolling}>
            {rolling ? 'Rolling…' : 'Roll 3d6'}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleProblem}>
            Problem
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleActivity}>
            Activity
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleTwist}>
            Twist
          </Button>
        </div>
        {fear ? (
          <p className="text-xs text-muted-foreground">
            Fear: <span className="text-foreground">{fear}</span>
          </p>
        ) : null}
        <div className="min-h-10 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs" aria-live="polite">
          {rollReveal ?? <span className="text-muted-foreground">Roll results appear here.</span>}
        </div>
      </TableSection>
    </Card>
  );
}
