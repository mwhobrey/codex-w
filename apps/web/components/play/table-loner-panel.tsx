'use client';

import {
  advanceTwistCounter,
  finalizeChanceRiskLabel,
  keepHighestDie,
  lookupTable,
  resolveChanceRiskOracle,
  resolveHarmFromOracle,
  rollDiceNotation,
  type ChanceRiskOracleLabel,
} from '@codex/game-engine';
import {
  applyTakeHarmToLuck,
  applyUnknownThreshold,
  getGameSystem,
  getLonerLuck,
  rechargeLonerLuck,
  rollD66Entry,
  pfConceptGrid,
  pfFrailtyGrid,
  pfGearGrid,
  pfSkillGrid,
} from '@codex/game-systems';
import type { PlaySessionLogEntry } from '@codex/schemas';
import { Button, Card, CardHeader, CardTitle, Textarea } from '@codex/ui';
import { useCallback, useState } from 'react';
import { RulesPrimerSection } from './rules-primer-section';
import { SceneFocusSection } from './scene-focus-section';
import {
  patchGameState,
  readGameStateNumber,
  type TablePanelProps,
} from './table-panel-types';
import { TableSection } from './table-section';

type Stance = 'none' | 'advantage' | 'disadvantage';

function rollDie(): number {
  return rollDiceNotation('1d6').groups[0]?.rolls[0]?.value ?? 1;
}

export function TableLonerPanel({
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
  const pf = engine?.paranormalFiles;

  const [question, setQuestion] = useState('');
  const [stance, setStance] = useState<Stance>('none');
  const [conflictMode, setConflictMode] = useState(false);
  const [oracleReveal, setOracleReveal] = useState<string | null>(null);
  const [extraReveal, setExtraReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const twistCounter = readGameStateNumber(meta, 'twistCounter', 0);
  const unknownThreshold = readGameStateNumber(meta, 'unknownThreshold', 0);

  const appendWithFocus = useCallback(
    (type: PlaySessionLogEntry['type'], content: string) => {
      onAppendLog({ type, content, author: logAuthor });
    },
    [logAuthor, onAppendLog],
  );

  const handleAskOracle = useCallback(() => {
    if (!question.trim() || !engine) return;
    setRolling(true);
    setOracleReveal(null);

    window.setTimeout(() => {
      let chancePool = [rollDie()];
      let riskPool = [rollDie()];
      if (stance === 'advantage') chancePool.push(rollDie());
      if (stance === 'disadvantage') riskPool.push(rollDie());

      const chance = keepHighestDie(chancePool);
      const risk = keepHighestDie(riskPool);
      const base = resolveChanceRiskOracle(chance, risk);
      const twist = advanceTwistCounter(twistCounter, base.isDouble);
      const finalLabel = finalizeChanceRiskLabel(base, twist);

      onUpdateMeta({
        gameState: patchGameState(meta, { twistCounter: twist.counter }),
      });

      const prefix = activeCharacter ? `[${activeCharacter.name}] ` : '';
      const stanceNote =
        stance === 'advantage' ? ' · Advantage' : stance === 'disadvantage' ? ' · Disadvantage' : '';
      let text = `${prefix}${question.trim()} → ${finalLabel} (Chance ${chance} vs Risk ${risk}${stanceNote}; twist ${twist.counter})`;

      if (twist.twistTriggered && engine.twistSubjects && engine.twistActions) {
        const subjectDie = rollDie();
        const actionDie = rollDie();
        const subject = lookupTable(engine.twistSubjects, subjectDie).entry;
        const action = lookupTable(engine.twistActions, actionDie).entry;
        const twistText = `Twist: ${subject} ${action.toLowerCase()}`;
        text += ` · ${twistText}`;
        appendWithFocus('twist', twistText);
      }

      if (conflictMode) {
        const harmLabel: ChanceRiskOracleLabel =
          finalLabel === 'Twist' ? 'Yes, but...' : finalLabel;
        const harm = resolveHarmFromOracle(harmLabel);
        text += ` · Harm: ${harm.direction} ${harm.amount}`;
        if (harm.direction === 'take' && activeCharacter && onPatchCharacter) {
          void onPatchCharacter((sheet) => applyTakeHarmToLuck(sheet, harm.amount));
          onOpenCharacterPeek?.('luck');
        }
      }

      setOracleReveal(text);
      appendWithFocus(finalLabel === 'Twist' ? 'twist' : 'oracle', text);
      setRolling(false);
    }, 480);
  }, [
    activeCharacter,
    appendWithFocus,
    conflictMode,
    engine,
    meta,
    onOpenCharacterPeek,
    onPatchCharacter,
    onUpdateMeta,
    question,
    stance,
    twistCounter,
  ]);

  const handleManualTwist = useCallback(() => {
    if (!engine?.twistSubjects || !engine.twistActions) return;
    const subjectDie = rollDie();
    const actionDie = rollDie();
    const subject = lookupTable(engine.twistSubjects, subjectDie).entry;
    const action = lookupTable(engine.twistActions, actionDie).entry;
    const text = `Twist (${subjectDie}/${actionDie}): ${subject} ${action.toLowerCase()}`;
    setExtraReveal(text);
    appendWithFocus('twist', text);
  }, [appendWithFocus, engine]);

  const handleSceneMood = useCallback(() => {
    if (!engine?.sceneMoodTable) return;
    const die = rollDie();
    const mood = lookupTable(engine.sceneMoodTable, die);
    const text = `Next scene (${die}): ${mood.entry}`;
    setExtraReveal(text);
    appendWithFocus('note', text);
  }, [appendWithFocus, engine]);

  const handleRechargeLuck = useCallback(() => {
    if (!activeCharacter || !onPatchCharacter) return;
    void onPatchCharacter((sheet) => rechargeLonerLuck(sheet));
    onOpenCharacterPeek?.('luck');
    const text = `${activeCharacter.name}: Luck recharged to 6 (conflict ended)`;
    setExtraReveal(text);
    appendWithFocus('note', text);
  }, [activeCharacter, appendWithFocus, onOpenCharacterPeek, onPatchCharacter]);

  const handleAnomalyExposure = useCallback(() => {
    if (!pf || !oracleReveal) return;
    // Use last oracle label if we can parse it; otherwise require a fresh roll via chips
    const match = oracleReveal.match(/→ (Yes(?:, (?:and|but)\.\.\.)?|No(?:, (?:and|but)\.\.\.)?|Twist)/);
    const label = match?.[1];
    if (!label || label === 'Twist') {
      setExtraReveal('Ask the Oracle first, then apply Unknown Threshold from that answer.');
      return;
    }
    const { next, fracture } = applyUnknownThreshold(unknownThreshold, label, pf.unknownThresholdMax);
    onUpdateMeta({ gameState: patchGameState(meta, { unknownThreshold: fracture ? 0 : next }) });
    let text = `Unknown Threshold: ${unknownThreshold} → ${fracture ? 0 : next} (${label})`;
    if (fracture) {
      const die = rollDie();
      const fractureEntry = lookupTable(pf.realityFractureTable, die);
      text += ` · REALITY FRACTURE (${die}): ${fractureEntry.entry}`;
      appendWithFocus('twist', fractureEntry.entry);
    }
    setExtraReveal(text);
    appendWithFocus('note', text);
  }, [appendWithFocus, meta, onUpdateMeta, oracleReveal, pf, unknownThreshold]);

  const handleChargenRoll = useCallback(
    (kind: 'concept' | 'skill' | 'frailty' | 'gear') => {
      const grids = {
        concept: pfConceptGrid,
        skill: pfSkillGrid,
        frailty: pfFrailtyGrid,
        gear: pfGearGrid,
      };
      const tens = rollDie();
      const ones = rollDie();
      const text = `${kind} d66 (${tens}${ones}): ${rollD66Entry(grids[kind], tens, ones)}`;
      setExtraReveal(text);
      appendWithFocus('note', text);
    },
    [appendWithFocus],
  );

  if (!engine || engine.kind !== 'loner-oracle') return null;

  const luck = getLonerLuck(activeCharacter ?? null);

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80" data-testid="table-loner-panel">
      <CardHeader className="border-b border-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name}</CardTitle>
      </CardHeader>

      <RulesPrimerSection points={plugin.rulesPrimer ?? []} />

      <SceneFocusSection
        placeholder="What's happening right now?"
        meta={meta}
        onUpdateMeta={onUpdateMeta}
        onAppendLog={onAppendLog}
        logAuthor={logAuthor}
        scenePrompts={engine.scenePrompts}
      />

      <TableSection title="Oracle (Chance vs Risk)">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a closed yes/no question…"
          rows={2}
          className="min-h-[60px] resize-none text-sm"
          data-testid="loner-oracle-question"
        />
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['none', 'Neutral'],
              ['advantage', 'Advantage'],
              ['disadvantage', 'Disadvantage'],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              variant={stance === id ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setStance(id)}
            >
              {label}
            </Button>
          ))}
          <Button
            type="button"
            variant={conflictMode ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setConflictMode((v) => !v)}
            title="Apply Harm & Luck to the active character on Take results"
          >
            Conflict
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            Twist Counter: <strong className="text-foreground">{twistCounter}</strong>/3
          </span>
          {activeCharacter ? (
            <span>
              Luck: <strong className="text-foreground">{luck}</strong>/6
            </span>
          ) : null}
          {pf ? (
            <span>
              Unknown Threshold:{' '}
              <strong className="text-foreground">{unknownThreshold}</strong>/
              {pf.unknownThresholdMax}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          className="w-full"
          size="sm"
          onClick={handleAskOracle}
          disabled={rolling || !question.trim()}
          data-testid="loner-ask-oracle"
        >
          {rolling ? 'Consulting…' : 'Ask Oracle (Chance vs Risk)'}
        </Button>
        <div
          className="min-h-10 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs"
          aria-live="polite"
          data-testid="loner-oracle-reveal"
        >
          {oracleReveal ?? (
            <span className="text-muted-foreground">Answer appears here and in the log.</span>
          )}
        </div>
      </TableSection>

      <TableSection title="Twists & scenes" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={handleManualTwist}>
            Roll Twist
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleSceneMood}>
            Next scene mood
          </Button>
          {activeCharacter && onPatchCharacter ? (
            <Button type="button" size="sm" variant="outline" onClick={handleRechargeLuck}>
              Recharge Luck
            </Button>
          ) : null}
        </div>
      </TableSection>

      {pf ? (
        <TableSection title="Operating in the Shadows" defaultOpen={false}>
          <p className="text-xs text-muted-foreground">
            After an Oracle answer about an anomaly, apply the Unknown Threshold change. At max,
            Reality Fracture fires and the counter resets.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleAnomalyExposure}>
              Apply threshold from last Oracle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                onUpdateMeta({ gameState: patchGameState(meta, { unknownThreshold: 0 }) });
                setExtraReveal('Unknown Threshold reset to 0');
              }}
            >
              Reset threshold
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" size="sm" variant="outline" onClick={() => handleChargenRoll('concept')}>
              d66 Concept
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleChargenRoll('skill')}>
              d66 Skill
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleChargenRoll('frailty')}>
              d66 Frailty
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleChargenRoll('gear')}>
              d66 Gear
            </Button>
          </div>
        </TableSection>
      ) : null}

      {extraReveal ? (
        <div className="border-t border-border/40 px-3 py-2 text-xs" aria-live="polite">
          {extraReveal}
        </div>
      ) : null}
    </Card>
  );
}
