'use client';

import { lookupTable, resolveRiskRoll, resolveYesNoOracle, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import { getGameSystem, type OracleLikelihoodId } from '@codex/game-systems';
import type { CharacterSheet, GameSystemId, PlaySessionLogEntry, TableMeta } from '@codex/schemas';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '@codex/ui';
import { useCallback, useEffect, useState } from 'react';
import { TableSection } from './table-section';

interface TableSystemPanelProps {
  gameSystemId: GameSystemId;
  meta: TableMeta;
  onUpdateMeta: (patch: Partial<TableMeta>) => void;
  onAppendLog: (
    entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>,
  ) => PlaySessionLogEntry | null;
  activeCharacter?: CharacterSheet | null;
  logAuthor?: string;
}

export function TableSystemPanel({
  gameSystemId,
  meta,
  onUpdateMeta,
  onAppendLog,
  activeCharacter,
  logAuthor = 'You',
}: TableSystemPanelProps) {
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;

  const [question, setQuestion] = useState('');
  const [likelihood, setLikelihood] = useState<OracleLikelihoodId>('even');
  const [sceneFocus, setSceneFocus] = useState(meta.sceneFocus ?? '');
  const [oracleReveal, setOracleReveal] = useState<string | null>(null);
  const [riskReveal, setRiskReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [mentorIndex, setMentorIndex] = useState(0);

  const appendWithFocus = useCallback(
    (type: PlaySessionLogEntry['type'], content: string) => {
      onAppendLog({
        type,
        content,
        author: logAuthor,
      });
    },
    [logAuthor, onAppendLog],
  );

  const handleAskOracle = useCallback(() => {
    if (!question.trim() || !engine?.oracleLikelihoods || !engine.oracleDice) return;
    setRolling(true);
    setOracleReveal(null);

    window.setTimeout(() => {
      const likelihoodConfig = engine.oracleLikelihoods!.find((l) => l.id === likelihood)!;
      const roll = rollDiceNotation(engine.oracleDice!);
      const die = roll.groups[0]?.rolls[0]?.value ?? 1;
      const result = resolveYesNoOracle(die, likelihoodConfig.threshold);
      const answer = result.answer === 'yes' ? 'Yes' : 'No';
      const prefix = activeCharacter ? `[${activeCharacter.name}] ` : '';
      const text = `${prefix}${question.trim()} → ${answer} (rolled ${result.roll}, needed ≤${result.threshold})`;

      setOracleReveal(text);
      appendWithFocus('oracle', text);
      setRolling(false);
    }, 480);
  }, [activeCharacter, appendWithFocus, engine, likelihood, question]);

  const handleRiskRoll = useCallback(() => {
    if (!engine?.riskDice || !engine.twistTable) return;
    setRolling(true);
    setRiskReveal(null);

    window.setTimeout(() => {
      const roll = rollDiceNotation(engine.riskDice!);
      const dice = roll.groups[0]?.rolls.map((r) => r.value) ?? [1, 1];
      const risk = resolveRiskRoll(dice[0]!, dice[1]!);
      let text = `Risk roll: ${risk.dice[0]} + ${risk.dice[1]} = ${risk.sum}`;

      if (risk.isTwist) {
        const twistRoll = rollDiceNotation('1d6');
        const twistDie = twistRoll.groups[0]?.rolls[0]?.value ?? 1;
        const twist = lookupTable(engine.twistTable!, twistDie);
        text += ` · TWIST — ${twist.entry}`;
        appendWithFocus('twist', twist.entry);
      }

      setRiskReveal(text);
      appendWithFocus('risk', text);
      setRolling(false);
    }, 520);
  }, [appendWithFocus, engine]);

  const handleTwist = useCallback(() => {
    if (!engine?.twistTable) return;
    const twistRoll = rollDiceNotation('1d6');
    const die = twistRoll.groups[0]?.rolls[0]?.value ?? 1;
    const twist = lookupTable(engine.twistTable, die);
    const text = `Twist (${die}): ${twist.entry}`;
    setRiskReveal(text);
    appendWithFocus('twist', text);
  }, [appendWithFocus, engine]);

  const handleScenePrompt = useCallback(() => {
    if (!engine) return;
    const prompt = engine.scenePrompts[promptIndex % engine.scenePrompts.length]!;
    setPromptIndex((i) => i + 1);
    appendWithFocus('scene', prompt);
  }, [appendWithFocus, engine, promptIndex]);

  const handleSceneBlur = useCallback(() => {
    if (sceneFocus !== (meta.sceneFocus ?? '')) {
      onUpdateMeta({ sceneFocus });
    }
  }, [meta.sceneFocus, onUpdateMeta, sceneFocus]);

  useEffect(() => {
    setSceneFocus(meta.sceneFocus ?? '');
  }, [meta.sceneFocus]);

  const handleMentorPrompt = useCallback(() => {
    if (!engine?.mentorPrompts?.length) return;
    const prompt = engine.mentorPrompts[mentorIndex % engine.mentorPrompts.length]!;
    setMentorIndex((i) => i + 1);
    appendWithFocus('scene', `${prompt.label}: ${prompt.text}`);
  }, [appendWithFocus, engine?.mentorPrompts, mentorIndex]);

  if (!engine) return null;

  const oracleLikelihoods = engine.oracleLikelihoods ?? [];
  const twistTable = engine.twistTable ?? [];
  const oracleDice = engine.oracleDice ?? '1d6';
  const riskDice = engine.riskDice ?? '2d6';
  const mentorPrompts = engine.mentorPrompts ?? [];
  const folklore = engine.folkloreTables;
  const showRisk = engine.kind === 'oracle' || Boolean(riskDice && twistTable.length);
  const currentMentor = mentorPrompts[mentorIndex % (mentorPrompts.length || 1)];

  return (
    <Card className="overflow-hidden border-codex-border/60 bg-codex-surface/80" data-testid="table-system-panel">
      <CardHeader className="border-b border-codex-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name}</CardTitle>
      </CardHeader>

      <TableSection title="Scene" defaultOpen>
        <Input
          value={sceneFocus}
          onChange={(e) => setSceneFocus(e.target.value)}
          onBlur={handleSceneBlur}
          placeholder="What's happening right now?"
          className="text-sm"
        />
        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleScenePrompt}>
          Draw a scene prompt →
        </Button>
      </TableSection>

      {mentorPrompts.length > 0 && (
        <TableSection title="Mentor" description={currentMentor?.label ?? 'Guided prompt'}>
          <p className="text-sm leading-relaxed text-codex-text">
            {currentMentor?.text ?? 'Draw a mentor prompt to begin.'}
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={handleMentorPrompt}>
            Next mentor prompt
          </Button>
        </TableSection>
      )}

      {folklore && (folklore.groveOmens?.length || folklore.jarResults?.length) ? (
        <TableSection title="Folklore" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {folklore.groveOmens?.length ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const max = tableMaxRoll(folklore.groveOmens!);
                  const roll = rollDiceNotation(`1d${max}`);
                  const die = roll.groups[0]?.rolls[0]?.value ?? 1;
                  const omen = lookupTable(folklore.groveOmens!, die);
                  const text = `Grove omen (${die}): ${omen.entry}`;
                  setRiskReveal(text);
                  appendWithFocus('scene', text);
                }}
              >
                Grove omen
              </Button>
            ) : null}
            {folklore.jarResults?.length ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const max = tableMaxRoll(folklore.jarResults!);
                  const roll = rollDiceNotation(`1d${max}`);
                  const die = roll.groups[0]?.rolls[0]?.value ?? 1;
                  const result = lookupTable(folklore.jarResults!, die);
                  const text = `Jar result (${die}): ${result.entry}`;
                  setRiskReveal(text);
                  appendWithFocus('oracle', text);
                }}
              >
                Jar result
              </Button>
            ) : null}
          </div>
        </TableSection>
      ) : null}

      {oracleLikelihoods.length > 0 && (
        <TableSection title="Oracle">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a yes/no question…"
            rows={2}
            className="min-h-[60px] resize-none text-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {oracleLikelihoods.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={likelihood === option.id ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                title={option.description}
                onClick={() => setLikelihood(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            className="w-full"
            size="sm"
            onClick={handleAskOracle}
            disabled={rolling || !question.trim()}
          >
            {rolling ? 'Consulting…' : `Ask oracle (${oracleDice})`}
          </Button>
          <div className="min-h-10 rounded-md border border-codex-border/40 bg-codex-void/40 px-3 py-2 text-xs" aria-live="polite">
            {oracleReveal ?? <span className="text-codex-text-muted">Answer appears here and in the log.</span>}
          </div>
        </TableSection>
      )}

      {showRisk && (
        <TableSection title="Risk & twist" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleRiskRoll} disabled={rolling}>
              Roll risk ({riskDice})
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleTwist} disabled={rolling}>
              Twist (d6)
            </Button>
          </div>
          <div className="min-h-10 rounded-md border border-codex-border/40 bg-codex-void/40 px-3 py-2 text-xs" aria-live="polite">
            {riskReveal ?? <span className="text-codex-text-muted">Results appear here and in the log.</span>}
          </div>
        </TableSection>
      )}
    </Card>
  );
}
