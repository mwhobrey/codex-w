'use client';

import { lookupTable, resolveForgeRoll, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import { getGameSystem, getSheetFieldValue } from '@codex/game-systems';
import type { GameSystemId, SoloSession } from '@codex/schemas';
import {
  Badge,
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
import { ActiveCharacterPanel } from './active-character-panel';
import { CharacterPicker } from './character-picker';
import { SessionPicker } from './session-picker';
import { SoloJournal } from './solo-journal';
import { useSoloSession } from './use-solo-session';

interface IronforgeGameState {
  vowProgress: number;
}

interface IronforgePlaySurfaceProps {
  sessionId?: string;
}

function readIronforgeState(session: SoloSession | undefined): IronforgeGameState {
  const raw = session?.gameState as IronforgeGameState | undefined;
  return { vowProgress: typeof raw?.vowProgress === 'number' ? raw.vowProgress : 0 };
}

function IronforgePlaySurfaceInner({ sessionId }: IronforgePlaySurfaceProps) {
  const gameSystemId: GameSystemId = 'ironforge';
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const vowConfig = engine?.vowProgress;

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

  const [sceneFocus, setSceneFocus] = useState('');
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [difficulty, setDifficulty] = useState('dangerous');
  const [scenePromptIndex, setScenePromptIndex] = useState(0);

  const gameState = readIronforgeState(session);
  const progressMax = vowConfig?.progressMax ?? 10;
  const grit = Number(activeCharacter?.fields.find((f) => f.key === 'grit')?.value ?? 1);
  const oath = activeCharacter ? getSheetFieldValue(activeCharacter, 'iron_oath') : '';

  useEffect(() => {
    if (session) {
      setSceneFocus(session.sceneFocus ?? '');
      setRollReveal(null);
    }
  }, [session?.id]);

  const saveGameState = useCallback(
    async (next: Partial<IronforgeGameState>) => {
      if (!session) return;
      const merged: IronforgeGameState = { ...readIronforgeState(session), ...next };
      await persistSession({
        ...session,
        gameState: merged as unknown as Record<string, unknown>,
        updatedAt: new Date().toISOString(),
      });
    },
    [persistSession, session],
  );

  const handleForgeRoll = useCallback(() => {
    if (!vowConfig) return;
    const diff = vowConfig.difficulties.find((d) => d.id === difficulty) ?? vowConfig.difficulties[1]!;
    setRolling(true);
    setRollReveal(null);

    window.setTimeout(() => {
      const result = resolveForgeRoll(grit, diff.target);
      let text = `Forge roll (${diff.label} ${diff.target}): [${result.dice.join(', ')}] + ${result.modifier} = ${result.total} → ${result.outcome.toUpperCase()}`;

      if (result.outcome === 'miss' && vowConfig.complicationTable.length) {
        const compRoll = rollDiceNotation(`1d${tableMaxRoll(vowConfig.complicationTable)}`);
        const die = compRoll.groups[0]?.rolls[0]?.value ?? 1;
        const comp = lookupTable(vowConfig.complicationTable, die);
        text += ` · ${comp.entry}`;
        void appendJournal('twist', comp.entry, { roll: die });
      } else if (result.progressGain > 0) {
        const nextProgress = Math.min(progressMax, gameState.vowProgress + result.progressGain);
        void saveGameState({ vowProgress: nextProgress });
        text += ` · +${result.progressGain} progress (${nextProgress}/${progressMax})`;
      }

      setRollReveal(text);
      void appendJournal('risk', text, {
        outcome: result.outcome,
        progressGain: result.progressGain,
        difficulty: diff.id,
      });
      setRolling(false);
    }, 520);
  }, [
    appendJournal,
    difficulty,
    gameState.vowProgress,
    grit,
    progressMax,
    saveGameState,
    vowConfig,
  ]);

  const handleHazard = useCallback(() => {
    if (!vowConfig?.hazardTable.length) return;
    const max = tableMaxRoll(vowConfig.hazardTable);
    const roll = rollDiceNotation(`1d${max}`);
    const die = roll.groups[0]?.rolls[0]?.value ?? 1;
    const hazard = lookupTable(vowConfig.hazardTable, die);
    const text = `Hazard (${die}): ${hazard.entry}`;
    setRollReveal(text);
    void appendJournal('scene', text, { roll: die });
  }, [appendJournal, vowConfig?.hazardTable]);

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
      void appendJournal('note', `Shift focus: ${sceneFocus.trim()}`);
    }
  }, [appendJournal, persistSession, sceneFocus, session]);

  const handleResetVow = useCallback(() => {
    void saveGameState({ vowProgress: 0 });
    void appendJournal('note', 'Oath track reset — swear anew.');
  }, [appendJournal, saveGameState]);

  if (!engine || engine.kind !== 'vow-progress' || !vowConfig) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground">Ironforge solo play is not configured.</p>
        <Link href="/solo" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← All solo systems
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary uppercase">Solo · {plugin.name}</p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">Oath & forge</h1>
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
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Shift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={sceneFocus}
                  onChange={(e) => setSceneFocus(e.target.value)}
                  placeholder="What beat of the industrial grind are you in?"
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

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Iron oath</CardTitle>
              <CardDescription>
                {oath || 'Link a character with an oath written on their sheet.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: progressMax }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-6 rounded-sm border ${
                      i < gameState.vowProgress
                        ? 'border-primary bg-primary'
                        : 'border-border bg-secondary/40'
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Progress {gameState.vowProgress}/{progressMax}
                {gameState.vowProgress >= progressMax ? ' — oath fulfilled (reset or raise stakes)' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-3">
                <Button type="button" className="codex-glow" onClick={handleForgeRoll} disabled={rolling}>
                  {rolling ? 'Rolling…' : `Roll 2d6 + grit (${grit})`}
                </Button>
                <Button type="button" variant="outline" onClick={handleHazard}>
                  Industrial hazard
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleResetVow}>
                  Reset track
                </Button>
              </div>
              <div
                className="min-h-12 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm"
                aria-live="polite"
              >
                {rollReveal ?? <span className="text-muted-foreground">Forge results appear here.</span>}
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

export function IronforgePlaySurface(props: IronforgePlaySurfaceProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-muted-foreground">Loading session…</div>
      }
    >
      <IronforgePlaySurfaceInner {...props} />
    </Suspense>
  );
}
