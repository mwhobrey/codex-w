'use client';

import { lookupTable, resolveRiskRoll, resolveYesNoOracle, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import { getGameSystem, type OracleLikelihoodId } from '@codex/game-systems';
import type { GameSystemId } from '@codex/schemas';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '@codex/ui';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ActiveCharacterPanel } from './active-character-panel';
import { CharacterPicker } from './character-picker';
import { SessionPicker } from './session-picker';
import { SoloJournal } from './solo-journal';
import { SoloMapPanel } from './solo-map-panel';
import { SoloScratchNotes } from './solo-scratch-notes';
import { useSoloSession } from './use-solo-session';

interface SoloPlaySurfaceProps {
  gameSystemId: GameSystemId;
  sessionId?: string;
  playTitle?: string;
}

function SoloPlaySurfaceInner({
  gameSystemId,
  sessionId: sessionIdProp,
  playTitle = 'Oracle play',
}: SoloPlaySurfaceProps) {
  const {
    ownerId,
    ownerReady,
    session,
    activeSessionId,
    activeCharacter,
    journalEntries,
    appendJournal,
    handleCharacterChange,
    handleSessionChange,
    handleExport,
    persistSession,
  } = useSoloSession(gameSystemId, sessionIdProp);
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;

  const [question, setQuestion] = useState('');
  const [likelihood, setLikelihood] = useState<OracleLikelihoodId>('even');
  const [sceneFocus, setSceneFocus] = useState('');
  const [oracleReveal, setOracleReveal] = useState<string | null>(null);
  const [riskReveal, setRiskReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [mentorIndex, setMentorIndex] = useState(0);

  useEffect(() => {
    if (session) {
      setSceneFocus(session.sceneFocus ?? '');
      setOracleReveal(null);
      setRiskReveal(null);
      setQuestion('');
    }
  }, [session?.id]);

  const journalWithFocus = useCallback(
    async (
      type: Parameters<typeof appendJournal>[0],
      content: string,
      metadata?: Record<string, unknown>,
    ) => {
      await appendJournal(type, content, metadata, {
        sceneFocus: sceneFocus || session?.sceneFocus,
      });
    },
    [appendJournal, sceneFocus, session?.sceneFocus],
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
      void journalWithFocus('oracle', text, { likelihood, roll: result.roll, answer: result.answer });
      setRolling(false);
    }, 480);
  }, [activeCharacter, engine, journalWithFocus, likelihood, question]);

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
        void journalWithFocus('twist', twist.entry, { roll: twist.roll });
      }

      setRiskReveal(text);
      void journalWithFocus('risk', text, { dice: risk.dice, isTwist: risk.isTwist });
      setRolling(false);
    }, 520);
  }, [engine, journalWithFocus]);

  const handleTwist = useCallback(() => {
    if (!engine?.twistTable) return;
    const twistRoll = rollDiceNotation('1d6');
    const die = twistRoll.groups[0]?.rolls[0]?.value ?? 1;
    const twist = lookupTable(engine.twistTable, die);
    const text = `Twist (${die}): ${twist.entry}`;
    setRiskReveal(text);
    void journalWithFocus('twist', text, { roll: die });
  }, [engine, journalWithFocus]);

  const handleScenePrompt = useCallback(() => {
    if (!engine) return;
    const prompt = engine.scenePrompts[promptIndex % engine.scenePrompts.length]!;
    setPromptIndex((i) => i + 1);
    void journalWithFocus('scene', prompt);
  }, [engine, journalWithFocus, promptIndex]);

  const handleSaveFocus = useCallback(async () => {
    if (!session) return;
    const updated = {
      ...session,
      sceneFocus,
      updatedAt: new Date().toISOString(),
    };
    await persistSession(updated);
    if (sceneFocus.trim()) {
      void journalWithFocus('note', `Scene focus: ${sceneFocus.trim()}`);
    }
  }, [journalWithFocus, persistSession, sceneFocus, session]);

  const handleGroveOmen = useCallback(() => {
    const omens = engine?.folkloreTables?.groveOmens;
    if (!omens?.length) return;
    const max = tableMaxRoll(omens);
    const roll = rollDiceNotation(`1d${max}`);
    const die = roll.groups[0]?.rolls[0]?.value ?? 1;
    const omen = lookupTable(omens, die);
    const text = `Grove omen (${die}): ${omen.entry}`;
    setRiskReveal(text);
    void journalWithFocus('scene', text, { roll: die, kind: 'omen' });
  }, [engine?.folkloreTables?.groveOmens, journalWithFocus]);

  const handleJarResult = useCallback(() => {
    const jars = engine?.folkloreTables?.jarResults;
    if (!jars?.length) return;
    const max = tableMaxRoll(jars);
    const roll = rollDiceNotation(`1d${max}`);
    const die = roll.groups[0]?.rolls[0]?.value ?? 1;
    const result = lookupTable(jars, die);
    const text = `Jar result (${die}): ${result.entry}`;
    setRiskReveal(text);
    void journalWithFocus('oracle', text, { roll: die, kind: 'jar' });
  }, [engine?.folkloreTables?.jarResults, journalWithFocus]);

  const handleMentorPrompt = useCallback(() => {
    if (!engine?.mentorPrompts?.length) return;
    const prompt = engine.mentorPrompts[mentorIndex % engine.mentorPrompts.length]!;
    setMentorIndex((i) => i + 1);
    void journalWithFocus('scene', `${prompt.label}: ${prompt.text}`, { mentorId: prompt.id });
  }, [engine?.mentorPrompts, journalWithFocus, mentorIndex]);

  const currentMentor =
    engine?.mentorPrompts?.[mentorIndex % (engine.mentorPrompts.length || 1)];

  if (!ownerReady) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (!engine || (engine.kind !== 'oracle' && engine.kind !== 'mentor')) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground">
          Solo play for {plugin.name} uses a different play surface.
        </p>
        <Link href={`/solo/${gameSystemId}`} className="mt-4 inline-block text-sm text-primary hover:underline">
          Open {plugin.name} →
        </Link>
        <Link href="/solo" className="mt-2 block text-sm text-muted-foreground hover:text-primary">
          ← All solo systems
        </Link>
      </div>
    );
  }

  const oracleLikelihoods = engine.oracleLikelihoods ?? [];
  const twistTable = engine.twistTable ?? [];
  const oracleDice = engine.oracleDice ?? '1d6';
  const riskDice = engine.riskDice ?? '2d6';
  const mentorPrompts = engine.mentorPrompts ?? [];
  const folklore = engine.folkloreTables;
  const showRisk = engine.kind === 'oracle' || Boolean(riskDice && twistTable.length);

  return (
    <div
      className="mx-auto max-w-5xl"
      data-testid={gameSystemId === 'loner' ? 'solo-loner-surface' : undefined}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Solo · {plugin.name}
          </p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">
            {playTitle}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{plugin.tagline}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/characters">Characters</Link>
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Scene
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={sceneFocus}
                  onChange={(e) => setSceneFocus(e.target.value)}
                  placeholder="What's happening right now?"
                />
                <Button type="button" variant="secondary" onClick={handleSaveFocus}>
                  Set
                </Button>
              </div>
              <Button type="button" variant="link" className="h-auto p-0" onClick={handleScenePrompt}>
                Draw a scene prompt →
              </Button>
            </CardContent>
          </Card>

          {mentorPrompts.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Mentor
                </CardTitle>
                <CardDescription>{currentMentor?.label ?? 'Guided prompt'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed text-foreground">
                  {currentMentor?.text ?? 'Draw a mentor prompt to begin.'}
                </p>
                <Button type="button" variant="secondary" onClick={handleMentorPrompt}>
                  Next mentor prompt →
                </Button>
              </CardContent>
            </Card>
          )}

          {folklore && (folklore.groveOmens?.length || folklore.jarResults?.length) ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Folklore
                </CardTitle>
                <CardDescription>Omens in the grove and what your jars do.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {folklore.groveOmens?.length ? (
                    <Button type="button" variant="outline" onClick={handleGroveOmen}>
                      Grove omen
                    </Button>
                  ) : null}
                  {folklore.jarResults?.length ? (
                    <Button type="button" variant="outline" onClick={handleJarResult}>
                      Jar result
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {oracleLikelihoods.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Oracle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a yes/no question…"
                rows={2}
                className="min-h-[72px] resize-none"
              />

              <div className="flex flex-wrap gap-2">
                {oracleLikelihoods.map((option) => (
                  <Button
                    key={option.id}
                    type="button"
                    variant={likelihood === option.id ? 'default' : 'outline'}
                    size="sm"
                    title={option.description}
                    onClick={() => setLikelihood(option.id)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <Button
                type="button"
                className="codex-glow w-full"
                onClick={handleAskOracle}
                disabled={rolling || !question.trim()}
              >
                {rolling ? 'Consulting the oracle…' : `Ask the oracle (${oracleDice})`}
              </Button>

              <div
                className="min-h-12 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm"
                aria-live="polite"
              >
                {oracleReveal ?? (
                  <span className="text-muted-foreground">Oracle answer appears here.</span>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {showRisk && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Risk & Twist
              </CardTitle>
              <CardDescription>
                Roll {riskDice} when the outcome is uncertain. Matching dice = twist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="default" onClick={handleRiskRoll} disabled={rolling}>
                  Roll risk ({riskDice})
                </Button>
                <Button type="button" variant="outline" onClick={handleTwist} disabled={rolling}>
                  Twist (d6)
                </Button>
              </div>
              <div
                className="min-h-12 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm"
                aria-live="polite"
              >
                {riskReveal ?? (
                  <span className="text-muted-foreground">Risk and twist results appear here.</span>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        <div className="space-y-4">
          <SessionPicker
            ownerId={ownerId}
            gameSystemId={gameSystemId}
            activeSessionId={activeSessionId}
            onSessionChange={handleSessionChange}
          />
          {session && (
            <>
            <Card>
              <CardContent className="pt-6">
                <CharacterPicker
                  ownerId={ownerId}
                  value={session.characterId}
                  onChange={handleCharacterChange}
                  preferredSystemId={gameSystemId}
                />
              </CardContent>
            </Card>
            <SoloMapPanel sessionId={session.id} />
            <SoloScratchNotes
              session={session}
              onSave={(scratchNotes) => {
                void persistSession({
                  ...session,
                  gameState: { ...session.gameState, scratchNotes },
                  updatedAt: new Date().toISOString(),
                });
              }}
            />
            </>
          )}
          <ActiveCharacterPanel character={activeCharacter} />
          <SoloJournal entries={journalEntries ?? []} onExport={handleExport} />
        </div>
      </div>

      <p className="mt-10 text-center">
        <Link href="/solo" className="text-sm text-muted-foreground hover:text-primary">
          ← All solo systems
        </Link>
      </p>
    </div>
  );
}

export function SoloPlaySurface(props: SoloPlaySurfaceProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-muted-foreground">
          Loading session…
        </div>
      }
    >
      <SoloPlaySurfaceInner {...props} />
    </Suspense>
  );
}
