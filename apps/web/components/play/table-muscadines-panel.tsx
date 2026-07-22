'use client';

import { lookupTable, resolveYesNoOracle, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import {
  adjustEndurance,
  applyBackgroundToSheet,
  defaultChallengeState,
  dieSides,
  getAttributeDie,
  getEndurance,
  getGameSystem,
  getSheetFieldValue,
  isMuscadinesAttribute,
  MUSCADINES_ATTRIBUTE_LABELS,
  MUSCADINES_ATTRIBUTES,
  parseDieRating,
  resolveMuscadinesCheck,
  type MuscadinesAttribute,
} from '@codex/game-systems';
import { Button, Card, CardHeader, CardTitle, Input, Textarea } from '@codex/ui';
import { useCallback, useEffect, useState } from 'react';
import { RulesPrimerSection } from './rules-primer-section';
import { SceneFocusSection } from './scene-focus-section';
import {
  patchGameState,
  readGameStateNumber,
  type TablePanelProps,
} from './table-panel-types';
import { TableSection } from './table-section';

function readGameStateString(
  meta: TablePanelProps['meta'],
  key: string,
  fallback = '',
): string {
  const raw = meta.gameState?.[key];
  return typeof raw === 'string' ? raw : fallback;
}

function readGameStateBool(meta: TablePanelProps['meta'], key: string): boolean {
  return meta.gameState?.[key] === true;
}

export function TableMuscadinesPanel({
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
  const mm = engine?.muscadines;
  const folklore = engine?.folkloreTables;
  const mentorPrompts = engine?.mentorPrompts ?? [];

  const [question, setQuestion] = useState('');
  const [oracleReveal, setOracleReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [attribute, setAttribute] = useState<MuscadinesAttribute>('willpower');
  const [impactDice, setImpactDice] = useState(1);
  const [cardsToBurn, setCardsToBurn] = useState(0);
  const [jarNotes, setJarNotes] = useState(
    activeCharacter ? getSheetFieldValue(activeCharacter, 'jar_spells') : '',
  );

  const handCards = readGameStateNumber(meta, 'handCards', 0);
  const challengeDR = readGameStateNumber(
    meta,
    'challengeDR',
    mm?.defaultChallengeDR ?? defaultChallengeState().challengeDR,
  );
  const challengeRS = readGameStateNumber(
    meta,
    'challengeRS',
    mm?.defaultChallengeRS ?? defaultChallengeState().challengeRS,
  );
  const challengeSuccesses = readGameStateNumber(meta, 'challengeSuccesses', 0);
  const challengeLabel = readGameStateString(meta, 'challengeLabel');
  const festivalMode = readGameStateBool(meta, 'festivalMode');
  const mentorIndex = readGameStateNumber(meta, 'mentorIndex', 0);
  const currentMentor = mentorPrompts[mentorIndex % (mentorPrompts.length || 1)];

  const attributeDie = getAttributeDie(activeCharacter, attribute);
  const endurance = getEndurance(activeCharacter);

  useEffect(() => {
    setJarNotes(activeCharacter ? getSheetFieldValue(activeCharacter, 'jar_spells') : '');
  }, [activeCharacter]);

  const patchChallenge = useCallback(
    (patch: Record<string, string | number | boolean | null>) => {
      onUpdateMeta({ gameState: patchGameState(meta, patch) });
    },
    [meta, onUpdateMeta],
  );

  const saveJarNotes = useCallback(async () => {
    if (!onPatchCharacter || !activeCharacter) return;
    await onPatchCharacter((sheet) => ({
      ...sheet,
      fields: sheet.fields.map((field) =>
        field.key === 'jar_spells' ? { ...field, value: jarNotes } : field,
      ),
      updatedAt: new Date().toISOString(),
    }));
    onAppendLog({ type: 'note', content: 'Jam spells saved to character sheet.', author: logAuthor });
  }, [activeCharacter, jarNotes, logAuthor, onAppendLog, onPatchCharacter]);

  const handleMentorPrompt = useCallback(() => {
    if (!mentorPrompts.length) return;
    const prompt = mentorPrompts[mentorIndex % mentorPrompts.length]!;
    const next = (mentorIndex + 1) % mentorPrompts.length;
    patchChallenge({ mentorIndex: next });
    const text = `Mentor — ${prompt.label}: ${prompt.text}`;
    setOracleReveal(text);
    onAppendLog({ type: 'scene', content: text, author: logAuthor });
  }, [logAuthor, mentorIndex, mentorPrompts, onAppendLog, patchChallenge]);

  const handleRandomMentor = useCallback(() => {
    if (!mentorPrompts.length) return;
    const die = rollDiceNotation(`1d${mentorPrompts.length}`).groups[0]?.rolls[0]?.value ?? 1;
    const prompt = mentorPrompts[die - 1] ?? mentorPrompts[0]!;
    const text = `Mentor (${die}) — ${prompt.label}: ${prompt.text}`;
    setOracleReveal(text);
    onAppendLog({ type: 'scene', content: text, author: logAuthor });
  }, [logAuthor, mentorPrompts, onAppendLog]);

  const handleOracle = useCallback(() => {
    if (!question.trim() || !engine?.oracleLikelihoods || !engine.oracleDice) return;
    const likelihoodConfig = engine.oracleLikelihoods.find((l) => l.id === 'even')!;
    const die = rollDiceNotation(engine.oracleDice).groups[0]?.rolls[0]?.value ?? 1;
    const result = resolveYesNoOracle(die, likelihoodConfig.threshold);
    const text = `${question.trim()} → ${result.answer === 'yes' ? 'Yes' : 'No'} (${result.roll} ≤ ${result.threshold})`;
    setOracleReveal(text);
    onAppendLog({ type: 'oracle', content: text, author: logAuthor });
  }, [engine?.oracleDice, engine?.oracleLikelihoods, logAuthor, onAppendLog, question]);

  const pullChargenTable = useCallback(
    (table: { roll: number; text: string }[] | undefined, kind: string) => {
      if (!table?.length) return;
      const max = tableMaxRoll(table);
      const die = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
      const row = lookupTable(table, die);
      const text = `${kind} (${die}): ${row.entry}`;
      setOracleReveal(text);
      onAppendLog({ type: 'scene', content: text, author: logAuthor });
    },
    [logAuthor, onAppendLog],
  );

  const handleChallengeRoll = useCallback(() => {
    setRolling(true);
    setOracleReveal(null);
    window.setTimeout(() => {
      const attrSides = dieSides(attributeDie);
      const burn = Math.max(0, Math.min(cardsToBurn, handCards));
      const impactCount = Math.max(0, impactDice) + burn;
      const rolls: number[] = [
        rollDiceNotation(`1d${attrSides}`).groups[0]?.rolls[0]?.value ?? 1,
      ];
      for (let i = 0; i < impactCount; i += 1) {
        rolls.push(rollDiceNotation('1d6').groups[0]?.rolls[0]?.value ?? 1);
      }

      const result = resolveMuscadinesCheck({
        attributeDie,
        impactDice,
        cardsToBurn: burn,
        handCards,
        challengeDR,
        challengeRS,
        challengeSuccesses,
        festivalMode,
        rolls,
      });

      const label = challengeLabel.trim() ? `${challengeLabel.trim()}: ` : '';
      const attrLabel = MUSCADINES_ATTRIBUTE_LABELS[attribute];
      const text = `${label}${attrLabel} ${parseDieRating(attributeDie)} + ${impactCount}d6 → ${result.summary}`;
      setOracleReveal(text);
      onAppendLog({ type: 'risk', content: text, author: logAuthor });

      const nextState: Record<string, string | number | boolean | null> = {
        handCards: result.handCards,
        challengeDR: result.challengeDR,
        challengeSuccesses: result.challengeOvercome ? 0 : result.challengeSuccesses,
      };
      if (result.challengeOvercome) {
        nextState.challengeLabel = '';
        onAppendLog({
          type: 'note',
          content: `Challenge overcome${challengeLabel.trim() ? ` — ${challengeLabel.trim()}` : ''}.`,
          author: logAuthor,
        });
      }
      patchChallenge(nextState);
      setCardsToBurn(0);
      setRolling(false);
    }, 420);
  }, [
    attribute,
    attributeDie,
    cardsToBurn,
    challengeDR,
    challengeLabel,
    challengeRS,
    challengeSuccesses,
    festivalMode,
    handCards,
    impactDice,
    logAuthor,
    onAppendLog,
    patchChallenge,
  ]);

  const handleSeedBackground = useCallback(async () => {
    if (!onPatchCharacter || !activeCharacter) return;
    const bg = getSheetFieldValue(activeCharacter, 'background');
    if (!bg) {
      setOracleReveal('Pick a Background on the character sheet first.');
      return;
    }
    await onPatchCharacter((sheet) => applyBackgroundToSheet(sheet, bg));
    onAppendLog({
      type: 'note',
      content: `Background “${bg}” seeded Endurance, Protection, and abilities.`,
      author: logAuthor,
    });
  }, [activeCharacter, logAuthor, onAppendLog, onPatchCharacter]);

  const bumpEndurance = useCallback(
    async (delta: number) => {
      if (!onPatchCharacter || !activeCharacter) return;
      await onPatchCharacter((sheet) => adjustEndurance(sheet, delta));
      onAppendLog({
        type: 'note',
        content: `Endurance ${delta >= 0 ? '+' : ''}${delta} → ${Math.max(0, endurance + delta)}.`,
        author: logAuthor,
      });
    },
    [activeCharacter, endurance, logAuthor, onAppendLog, onPatchCharacter],
  );

  if (!engine || engine.kind !== 'mentor') return null;

  return (
    <Card
      className="overflow-hidden border-border/60 bg-card/80"
      data-testid="table-muscadines-panel"
    >
      <CardHeader className="border-b border-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name} · Grove</CardTitle>
      </CardHeader>

      <RulesPrimerSection points={plugin.rulesPrimer ?? []} />

      <SceneFocusSection
        title="Season"
        placeholder="Late harvest, festival week, Wildernight trek…"
        meta={meta}
        onUpdateMeta={onUpdateMeta}
        onAppendLog={onAppendLog}
        logAuthor={logAuthor}
        scenePrompts={engine.scenePrompts}
      />

      <TableSection title="Mentor" description={currentMentor?.label}>
        <p className="text-sm leading-relaxed text-foreground">{currentMentor?.text}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleMentorPrompt}
            data-testid="muscadines-next-mentor"
          >
            Next mentor prompt
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleRandomMentor}>
            Random mentor
          </Button>
        </div>
      </TableSection>

      <TableSection
        title="Challenge (lite)"
        description="Attribute + Impact vs DR. Setback → +1 card. Burn cards for +1d6 Impact each. Full card suits / feats: use the book."
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Label
            <Input
              value={challengeLabel}
              onChange={(e) => patchChallenge({ challengeLabel: e.target.value })}
              placeholder="Mossback standoff…"
              className="h-8 w-40 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            DR
            <Input
              type="number"
              min={1}
              value={challengeDR}
              onChange={(e) => patchChallenge({ challengeDR: Number(e.target.value) || 1 })}
              className="h-8 w-16 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            RS
            <Input
              type="number"
              min={1}
              value={challengeRS}
              onChange={(e) => patchChallenge({ challengeRS: Number(e.target.value) || 1 })}
              className="h-8 w-16 text-sm"
            />
          </label>
          <span className="pb-1.5 text-xs text-muted-foreground">
            Progress {challengeSuccesses}/{challengeRS} · Hand {handCards}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MUSCADINES_ATTRIBUTES.map((attr) => (
            <Button
              key={attr}
              type="button"
              size="sm"
              variant={attribute === attr ? 'default' : 'outline'}
              onClick={() => setAttribute(attr)}
            >
              {MUSCADINES_ATTRIBUTE_LABELS[attr]}
              {activeCharacter && isMuscadinesAttribute(attr)
                ? ` ${getAttributeDie(activeCharacter, attr)}`
                : ''}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <label className="flex items-center gap-1.5">
            Impact d6
            <Input
              type="number"
              min={0}
              max={6}
              value={impactDice}
              onChange={(e) => setImpactDice(Math.max(0, Number(e.target.value) || 0))}
              className="h-8 w-14 text-sm"
            />
          </label>
          <label className="flex items-center gap-1.5">
            Burn cards
            <Input
              type="number"
              min={0}
              max={handCards}
              value={cardsToBurn}
              onChange={(e) =>
                setCardsToBurn(Math.max(0, Math.min(handCards, Number(e.target.value) || 0)))
              }
              className="h-8 w-14 text-sm"
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant={festivalMode ? 'default' : 'outline'}
            onClick={() => patchChallenge({ festivalMode: !festivalMode })}
          >
            Festival DR+1
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              patchChallenge({
                challengeSuccesses: 0,
                challengeDR: mm?.defaultChallengeDR ?? 8,
                challengeRS: mm?.defaultChallengeRS ?? 2,
                challengeLabel: '',
              })
            }
          >
            Reset challenge
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={rolling}
          onClick={handleChallengeRoll}
          data-testid="muscadines-challenge-roll"
        >
          {rolling ? 'Rolling…' : `Roll ${attributeDie} + ${impactDice + Math.min(cardsToBurn, handCards)}d6`}
        </Button>
      </TableSection>

      <TableSection title="Endurance" description={activeCharacter ? undefined : 'Bind a character to track Endurance.'}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Endurance {endurance}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!activeCharacter || !onPatchCharacter}
            onClick={() => void bumpEndurance(-1)}
          >
            −1
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!activeCharacter || !onPatchCharacter}
            onClick={() => void bumpEndurance(1)}
          >
            +1
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!activeCharacter || !onPatchCharacter}
            onClick={() => void handleSeedBackground()}
          >
            Seed background stats
          </Button>
        </div>
      </TableSection>

      <TableSection title="Chargen rolls" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullChargenTable(mm?.styles, 'Style')}
          >
            Style
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullChargenTable(mm?.quirks, 'Quirk')}
          >
            Quirk
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullChargenTable(mm?.startingItems, 'Starting item')}
          >
            Starting item
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => pullChargenTable(mm?.backgrounds, 'Background')}
          >
            Background
          </Button>
        </div>
      </TableSection>

      <TableSection title="Jam spells">
        <Textarea
          value={jarNotes}
          onChange={(e) => setJarNotes(e.target.value)}
          rows={3}
          className="text-sm"
          placeholder="Ingredients in the jar and how their effects meld…"
        />
        <Button
          type="button"
          size="sm"
          disabled={!activeCharacter || !onPatchCharacter}
          onClick={() => void saveJarNotes()}
          data-testid="muscadines-save-recipe"
        >
          Save to character
        </Button>
      </TableSection>

      {folklore?.groveOmens?.length || folklore?.jarResults?.length ? (
        <TableSection
          title="Codex flavor"
          description="Play-aid prompts — not official book tables."
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-2">
            {folklore.groveOmens?.length ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const max = tableMaxRoll(folklore.groveOmens!);
                  const die = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
                  const omen = lookupTable(folklore.groveOmens!, die);
                  const text = `Codex scene (${die}): ${omen.entry}`;
                  setOracleReveal(text);
                  onAppendLog({ type: 'scene', content: text, author: logAuthor });
                }}
              >
                Scene flavor
              </Button>
            ) : null}
            {folklore.jarResults?.length ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const max = tableMaxRoll(folklore.jarResults!);
                  const die = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
                  const result = lookupTable(folklore.jarResults!, die);
                  const text = `Codex jam (${die}): ${result.entry}`;
                  setOracleReveal(text);
                  onAppendLog({ type: 'oracle', content: text, author: logAuthor });
                }}
              >
                Jam flavor
              </Button>
            ) : null}
          </div>
        </TableSection>
      ) : null}

      <TableSection title="Oracle" defaultOpen={false}>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a yes/no question…"
          className="text-sm"
        />
        <Button type="button" size="sm" onClick={handleOracle} disabled={!question.trim()}>
          Ask oracle
        </Button>
        <div
          className="min-h-8 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs"
          data-testid="muscadines-reveal"
        >
          {oracleReveal ?? <span className="text-muted-foreground">Rolls and answers appear here.</span>}
        </div>
      </TableSection>
    </Card>
  );
}
