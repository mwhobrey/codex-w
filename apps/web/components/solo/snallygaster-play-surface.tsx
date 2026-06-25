'use client';

import { lookupTable, resolveLasersFeelings, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import { getGameSystem, getSheetFieldValue } from '@codex/game-systems';
import type { GameSystemId, SoloSession } from '@codex/schemas';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@codex/ui';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import type { LasersFeelingsMode } from '@codex/game-engine';
import { ActiveCharacterPanel } from './active-character-panel';
import { CharacterPicker } from './character-picker';
import { SessionPicker } from './session-picker';
import { SoloJournal } from './solo-journal';
import { useSoloSession } from './use-solo-session';

interface SnallygasterPlaySurfaceProps {
  sessionId?: string;
}

interface SnallygasterGameState {
  campWeek: number;
}

function readCampWeek(session: SoloSession | undefined): number {
  const raw = session?.gameState as SnallygasterGameState | undefined;
  const week = raw?.campWeek;
  return typeof week === 'number' && week >= 1 && week <= 8 ? week : 1;
}

function SnallygasterPlaySurfaceInner({ sessionId }: SnallygasterPlaySurfaceProps) {
  const gameSystemId: GameSystemId = 'snallygaster';
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const lf = engine?.lasersFeelings;

  const {
    ownerId,
    session,
    activeSessionId,
    activeCharacter,
    journalEntries,
    appendJournal,
    handleCharacterChange,
    handleSessionChange,
    handleExport,
    persistSession,
  } = useSoloSession(gameSystemId, sessionId);

  const [mode, setMode] = useState<LasersFeelingsMode>('counselor');
  const [sceneFocus, setSceneFocus] = useState('');
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [scenePromptIndex, setScenePromptIndex] = useState(0);

  const counselorStat = Number(
    activeCharacter?.fields.find((f) => f.key === 'counselor_stat')?.value ?? 3,
  );
  const monsterStat = Number(
    activeCharacter?.fields.find((f) => f.key === 'monster_stat')?.value ?? 3,
  );
  const stat = mode === 'counselor' ? counselorStat : monsterStat;

  useEffect(() => {
    if (session) {
      setSceneFocus(session.sceneFocus ?? '');
      setRollReveal(null);
    }
  }, [session?.id]);

  const handleRoll = useCallback(() => {
    setRolling(true);
    setRollReveal(null);

    window.setTimeout(() => {
      const result = resolveLasersFeelings(stat, mode);
      const label = mode === 'counselor' ? lf?.counselorLabel ?? 'Counselor' : lf?.monsterLabel ?? 'Monster';
      const text = `${label} (${stat}): [${result.dice.join(', ')}] → ${result.success ? 'SUCCESS' : 'FAIL'}`;
      setRollReveal(text);
      void appendJournal('risk', text, { mode, stat, dice: result.dice, success: result.success });
      setRolling(false);
    }, 520);
  }, [appendJournal, lf?.counselorLabel, lf?.monsterLabel, mode, stat]);

  const handleProblem = useCallback(() => {
    if (!lf) return;
    const max = tableMaxRoll(lf.problemTable);
    const roll = rollDiceNotation(`1d${max}`);
    const die = roll.groups[0]?.rolls[0]?.value ?? 1;
    const problem = lookupTable(lf.problemTable, die);
    const text = `Camp problem (${die}): ${problem.entry}`;
    setRollReveal(text);
    void appendJournal('scene', text, { roll: die });
  }, [appendJournal, lf]);

  const handleActivity = useCallback(() => {
    if (!lf?.activityTable?.length) return;
    const max = tableMaxRoll(lf.activityTable);
    const roll = rollDiceNotation(`1d${max}`);
    const die = roll.groups[0]?.rolls[0]?.value ?? 1;
    const activity = lookupTable(lf.activityTable, die);
    const text = `Camp activity (${die}): ${activity.entry}`;
    setRollReveal(text);
    void appendJournal('scene', text, { roll: die, kind: 'activity' });
  }, [appendJournal, lf?.activityTable]);

  const handleTwist = useCallback(() => {
    if (!engine?.twistTable) return;
    const max = tableMaxRoll(engine.twistTable);
    const roll = rollDiceNotation(`1d${max}`);
    const die = roll.groups[0]?.rolls[0]?.value ?? 1;
    const twist = lookupTable(engine.twistTable, die);
    const text = `Twist (${die}): ${twist.entry}`;
    setRollReveal(text);
    void appendJournal('twist', text, { roll: die });
  }, [appendJournal, engine?.twistTable]);

  const handleScenePrompt = useCallback(() => {
    if (!engine) return;
    const prompt = engine.scenePrompts[scenePromptIndex % engine.scenePrompts.length]!;
    setScenePromptIndex((i) => i + 1);
    void appendJournal('scene', prompt);
  }, [appendJournal, engine, scenePromptIndex]);

  const handleSaveFocus = useCallback(async () => {
    if (!session) return;
    await persistSession({
      ...session,
      sceneFocus,
      updatedAt: new Date().toISOString(),
    });
    if (sceneFocus.trim()) {
      void appendJournal('note', `Scene: ${sceneFocus.trim()}`);
    }
  }, [appendJournal, persistSession, sceneFocus, session]);

  const campWeek = readCampWeek(session);

  const setCampWeek = useCallback(
    async (week: number) => {
      if (!session) return;
      const clamped = Math.max(1, Math.min(8, week));
      await persistSession({
        ...session,
        gameState: { campWeek: clamped } as unknown as Record<string, unknown>,
        updatedAt: new Date().toISOString(),
      });
      void appendJournal('note', `Summer week ${clamped} of 8`);
    },
    [appendJournal, persistSession, session],
  );

  if (!engine || engine.kind !== 'lasers-feelings' || !lf) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground">Camp Snallygaster solo play is not configured.</p>
        <Link href="/solo" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← All solo systems
        </Link>
      </div>
    );
  }

  const fear = activeCharacter ? getSheetFieldValue(activeCharacter, 'fear') : '';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary uppercase">Solo · {plugin.name}</p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">Camp horror</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{plugin.tagline}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/characters">Characters</Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Scene</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={sceneFocus}
                  onChange={(e) => setSceneFocus(e.target.value)}
                  placeholder="What's happening at camp right now?"
                />
                <Button type="button" variant="secondary" onClick={handleSaveFocus}>
                  Set
                </Button>
              </div>
              <Button type="button" variant="link" className="h-auto p-0" onClick={handleScenePrompt}>
                Draw a scene prompt →
              </Button>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Summer week {campWeek}/8</span>
                <Button type="button" variant="outline" size="sm" onClick={() => void setCampWeek(campWeek + 1)}>
                  Next week
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Lasers & Feelings
              </CardTitle>
              <CardDescription>
                Counselor: any die &gt; stat. Monster: any die &lt; stat. Roll 3d6.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={mode === 'counselor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('counselor')}
                >
                  {lf.counselorLabel} ({counselorStat})
                </Button>
                <Button
                  type="button"
                  variant={mode === 'monster' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('monster')}
                >
                  {lf.monsterLabel} ({monsterStat})
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" className="codex-glow" onClick={handleRoll} disabled={rolling}>
                  {rolling ? 'Rolling…' : 'Roll 3d6'}
                </Button>
                <Button type="button" variant="outline" onClick={handleProblem}>
                  Camp problem
                </Button>
                <Button type="button" variant="outline" onClick={handleActivity}>
                  Activity
                </Button>
                <Button type="button" variant="outline" onClick={handleTwist}>
                  Twist
                </Button>
              </div>
              {fear && (
                <p className="text-xs text-muted-foreground">
                  Fear on sheet: <span className="text-foreground">{fear}</span>
                </p>
              )}
              <div
                className="min-h-12 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm"
                aria-live="polite"
              >
                {rollReveal ?? (
                  <span className="text-muted-foreground">Roll results appear here.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <SessionPicker
            ownerId={ownerId}
            gameSystemId={gameSystemId}
            activeSessionId={activeSessionId}
            onSessionChange={handleSessionChange}
          />
          {session && (
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

export function SnallygasterPlaySurface(props: SnallygasterPlaySurfaceProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-muted-foreground">Loading session…</div>
      }
    >
      <SnallygasterPlaySurfaceInner {...props} />
    </Suspense>
  );
}
