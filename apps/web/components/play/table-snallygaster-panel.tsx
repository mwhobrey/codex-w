'use client';

import { lookupTable, resolveLasersFeelings, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import type { LasersFeelingsMode, LasersFeelingsOutcome } from '@codex/game-engine';
import {
  getGameSystem,
  campDayArcLabel,
  driftSkillAfterFailure,
  getSheetFieldValue,
  lookupCampTable,
  monstrousProblemsForDay,
  resolveSnallygasterNumber,
} from '@codex/game-systems';
import { Button, Card, CardHeader, CardTitle } from '@codex/ui';
import { useCallback, useState } from 'react';
import { RulesPrimerSection } from './rules-primer-section';
import { SceneFocusSection } from './scene-focus-section';
import { patchGameState, readGameStateNumber, type TablePanelProps } from './table-panel-types';
import { TableSection } from './table-section';

const OUTCOME_LABEL: Record<LasersFeelingsOutcome, string> = {
  fail: 'FAIL — it goes wrong (Skill drifts)',
  mixed: 'MIXED — barely manage it (cost / complication)',
  success: 'SUCCESS — you do it well',
  critical: 'CRITICAL — extra effect!',
};

export function TableSnallygasterPanel({
  gameSystemId,
  meta,
  onUpdateMeta,
  onAppendLog,
  activeCharacter,
  logAuthor = 'You',
  onPatchCharacter,
}: TablePanelProps) {
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const lf = engine?.lasersFeelings;

  const [mode, setMode] = useState<LasersFeelingsMode>('counselor');
  const [useItem, setUseItem] = useState(false);
  const [related, setRelated] = useState(false);
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [monstrousCounselor, setMonstrousCounselor] = useState(false);
  const [rolling, setRolling] = useState(false);

  const campDay = Math.min(
    5,
    Math.max(1, readGameStateNumber(meta, 'campDay', readGameStateNumber(meta, 'campWeek', 1))),
  );
  const skill = resolveSnallygasterNumber(activeCharacter);
  const motivation = activeCharacter ? getSheetFieldValue(activeCharacter, 'motivation') : '';
  const diceCount = Math.min(3, 1 + (useItem ? 1 : 0) + (related ? 1 : 0));
  const monstrousQuota = monstrousProblemsForDay(campDay);

  const setCampDay = useCallback(
    (day: number) => {
      const clamped = Math.max(1, Math.min(5, day));
      onUpdateMeta({ gameState: patchGameState(meta, { campDay: clamped, campWeek: clamped }) });
      onAppendLog({
        type: 'note',
        content: `Camp day ${clamped} of 5 — ${campDayArcLabel(clamped)}`,
        author: logAuthor,
      });
    },
    [meta, onAppendLog, onUpdateMeta, logAuthor],
  );

  const handleRoll = useCallback(() => {
    if (!lf) return;
    setRolling(true);
    setRollReveal(null);
    setMonstrousCounselor(false);
    window.setTimeout(() => {
      const result = resolveLasersFeelings(skill, mode, { diceCount });
      const label = mode === 'counselor' ? lf.counselorLabel : lf.monsterLabel;
      const outcome = OUTCOME_LABEL[result.outcome];
      let text = `${label} (Skill ${result.stat}, ${diceCount}d6): [${result.dice.join(', ')}] → ${result.successes} success${result.successes === 1 ? '' : 'es'} — ${outcome}`;

      if (result.laserFeelings) {
        text +=
          ' Monstrous Counselor! Ask an honest question, gain a new item, or secretly decide what the monster wants next.';
        setMonstrousCounselor(true);
      }

      if (!result.success && onPatchCharacter && activeCharacter) {
        void onPatchCharacter((sheet) => driftSkillAfterFailure(sheet, mode)).then((next) => {
          if (next) {
            const drifted = resolveSnallygasterNumber(next);
            onAppendLog({
              type: 'note',
              content: `Skill drifts to ${drifted} after a failed ${label} roll.`,
              author: logAuthor,
            });
          }
        });
      }

      setRollReveal(text);
      onAppendLog({ type: 'risk', content: text, author: logAuthor });
      setRolling(false);
    }, 520);
  }, [
    activeCharacter,
    diceCount,
    lf,
    logAuthor,
    mode,
    onAppendLog,
    onPatchCharacter,
    skill,
  ]);

  const pullTable = useCallback(
    (
      table: { roll: number; text: string }[] | undefined,
      kind: string,
      bias: boolean,
    ) => {
      if (!table?.length) return;
      const max = tableMaxRoll(table);
      const rawDie = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
      if (bias) {
        const row = lookupCampTable(table, rawDie, campDay);
        const text = `${kind} (day ${campDay}, ${rawDie}→${row.die}): ${row.entry}`;
        setRollReveal(text);
        setMonstrousCounselor(false);
        onAppendLog({ type: 'scene', content: text, author: logAuthor });
        return;
      }
      const row = lookupTable(table, rawDie);
      const text = `${kind} (${rawDie}): ${row.entry}`;
      setRollReveal(text);
      setMonstrousCounselor(false);
      onAppendLog({ type: 'scene', content: text, author: logAuthor });
    },
    [campDay, logAuthor, onAppendLog],
  );

  const handleMentor = useCallback(() => {
    const prompts = engine?.mentorPrompts;
    if (!prompts?.length) return;
    const die = rollDiceNotation(`1d${prompts.length}`).groups[0]?.rolls[0]?.value ?? 1;
    const prompt = prompts[die - 1] ?? prompts[0]!;
    const text = `Mentor — ${prompt.label}: ${prompt.text}`;
    setRollReveal(text);
    setMonstrousCounselor(false);
    onAppendLog({ type: 'scene', content: text, author: logAuthor });
  }, [engine?.mentorPrompts, logAuthor, onAppendLog]);

  if (!engine || engine.kind !== 'lasers-feelings' || !lf) return null;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80" data-testid="table-snallygaster-panel">
      <CardHeader className="border-b border-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name} · PATH</CardTitle>
      </CardHeader>

      <RulesPrimerSection points={plugin.rulesPrimer ?? []} />

      <SceneFocusSection
        placeholder="What's happening at camp?"
        meta={meta}
        onUpdateMeta={onUpdateMeta}
        onAppendLog={onAppendLog}
        logAuthor={logAuthor}
        scenePrompts={engine.scenePrompts}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Day {campDay}/5</span>
          <span className="text-xs text-muted-foreground/60">{campDayArcLabel(campDay)}</span>
          {monstrousQuota > 0 ? (
            <span className="text-xs text-muted-foreground/60">
              ({monstrousQuota} monstrous today)
            </span>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => setCampDay(campDay + 1)}>
            Next day
          </Button>
        </div>
      </SceneFocusSection>

      <TableSection
        title="Counselor & Monster"
        description={`Counselor: roll over ${skill}. Monster: roll under ${skill}. Exact = Monstrous Counselor.`}
      >
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={mode === 'counselor' ? 'default' : 'outline'}
            onClick={() => setMode('counselor')}
          >
            {lf.counselorLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'monster' ? 'default' : 'outline'}
            onClick={() => setMode('monster')}
          >
            {lf.monsterLabel}
          </Button>
          <span className="self-center text-xs text-muted-foreground" data-testid="snally-number">
            Skill {skill}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={useItem ? 'default' : 'outline'}
            onClick={() => setUseItem((v) => !v)}
          >
            Using item
          </Button>
          <Button
            type="button"
            size="sm"
            variant={related ? 'default' : 'outline'}
            onClick={() => setRelated((v) => !v)}
          >
            Style / Specialty / Motivation
          </Button>
          <span className="self-center text-xs text-muted-foreground">{diceCount}d6</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleRoll}
            disabled={rolling}
            data-testid="snally-roll"
          >
            {rolling ? 'Rolling…' : `Roll ${diceCount}d6`}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.mischiefTable ?? lf.problemTable, 'Mundane', true)}
          >
            Mundane
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.monstrousTable, 'Monstrous', true)}
          >
            Monstrous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.activityTable, 'Activity', false)}
          >
            Activity
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.locationTable, 'Location', false)}
          >
            Location
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.monsterTable, 'Monster', false)}
          >
            Monster
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.campLeaderTable, 'Camp leader', false)}
          >
            Leader plot
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.monsterMotiveTable ?? engine.twistTable, 'That is…', false)}
          >
            Motive
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullTable(lf.decisionOracleTable, 'Oracle', false)}
          >
            Oracle
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleMentor}>
            Mentor
          </Button>
        </div>
        {motivation ? (
          <p className="text-xs text-muted-foreground">
            Motivation: <span className="text-foreground">{motivation}</span>
          </p>
        ) : null}
        {monstrousCounselor ? (
          <p className="text-xs text-primary" data-testid="laser-feelings-callout">
            Monstrous Counselor — ask a question the Ranger must answer honestly, gain a new item, or
            secretly decide what the monster wants next.
          </p>
        ) : null}
        <div
          className="min-h-10 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs"
          aria-live="polite"
          data-testid="snally-roll-reveal"
        >
          {rollReveal ?? <span className="text-muted-foreground">Roll results appear here.</span>}
        </div>
      </TableSection>
    </Card>
  );
}
