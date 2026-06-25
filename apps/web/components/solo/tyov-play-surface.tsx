'use client';

import { advancePromptIndex } from '@codex/game-engine';
import { getGameSystem, getTyovCapacity } from '@codex/game-systems';
import type { GameSystemId } from '@codex/schemas';
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

interface TyovPlaySurfaceProps {
  sessionId?: string;
}

function TyovPlaySurfaceInner({ sessionId }: TyovPlaySurfaceProps) {
  const gameSystemId: GameSystemId = 'totv';
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const prompts = engine?.prompts ?? [];

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

  const [promptIndex, setPromptIndex] = useState(1);
  const [jumpPrompt, setJumpPrompt] = useState('');
  const [sceneFocus, setSceneFocus] = useState('');
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [scenePromptIndex, setScenePromptIndex] = useState(0);

  useEffect(() => {
    if (session) {
      setSceneFocus(session.sceneFocus ?? '');
      setRollReveal(null);
    }
  }, [session?.id]);

  const currentPrompt = prompts.find((p) => p.id === promptIndex) ?? prompts[0];
  const capacity = getTyovCapacity(activeCharacter);

  const handleDeclinePrompt = useCallback(() => {
    if (!currentPrompt) return;
    void appendJournal('note', `Declined prompt ${currentPrompt.id} — moved on without writing.`, {
      promptId: currentPrompt.id,
      declined: true,
    });
    if (engine?.promptAdvance) {
      const { minPrompt, maxPrompt } = engine.promptAdvance;
      const result = advancePromptIndex(promptIndex, minPrompt, maxPrompt);
      setPromptIndex(result.next);
      setRollReveal(`Declined · navigation → prompt ${result.next}`);
    }
  }, [appendJournal, currentPrompt, engine?.promptAdvance, promptIndex]);

  const handleJumpPrompt = useCallback(() => {
    if (!engine?.promptAdvance) return;
    const n = Number.parseInt(jumpPrompt, 10);
    if (Number.isNaN(n)) return;
    const { minPrompt, maxPrompt } = engine.promptAdvance;
    const clamped = Math.max(minPrompt, Math.min(maxPrompt, n));
    setPromptIndex(clamped);
    setJumpPrompt('');
    void appendJournal('note', `Jumped to prompt ${clamped}`);
  }, [appendJournal, engine?.promptAdvance, jumpPrompt]);

  const handleAdvancePrompt = useCallback(() => {
    if (!engine?.promptAdvance) return;
    setRolling(true);
    setRollReveal(null);

    window.setTimeout(() => {
      const { minPrompt, maxPrompt } = engine.promptAdvance!;
      const result = advancePromptIndex(promptIndex, minPrompt, maxPrompt);
      setPromptIndex(result.next);
      const text = `d10 (${result.d10}) − d6 (${result.d6}) = ${result.delta >= 0 ? '+' : ''}${result.delta} → prompt ${result.next}`;
      setRollReveal(text);
      void appendJournal('oracle', text, {
        d10: result.d10,
        d6: result.d6,
        delta: result.delta,
        promptId: result.next,
      });
      setRolling(false);
    }, 480);
  }, [appendJournal, engine?.promptAdvance, promptIndex]);

  const handleTakePrompt = useCallback(() => {
    if (!currentPrompt) return;
    const prefix = activeCharacter ? `[${activeCharacter.name}] ` : '';
    void appendJournal('scene', `${prefix}Prompt ${currentPrompt.id}: ${currentPrompt.text}`, {
      promptId: currentPrompt.id,
    });
  }, [activeCharacter, appendJournal, currentPrompt]);

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
      void appendJournal('note', `Era focus: ${sceneFocus.trim()}`);
    }
  }, [appendJournal, persistSession, sceneFocus, session]);

  if (!engine || engine.kind !== 'prompt-journal') {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground">TYOV solo play is not configured.</p>
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
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">
            Prompt journal
          </h1>
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
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Era</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={sceneFocus}
                  onChange={(e) => setSceneFocus(e.target.value)}
                  placeholder="Where in your long life are you now?"
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
              <CardTitle className="font-display text-lg">Prompt {currentPrompt?.id ?? '—'}</CardTitle>
              <CardDescription>Roll d10 − d6 to wander the journal. Write your answer on the sheet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPrompt?.tags && currentPrompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentPrompt.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] uppercase">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-base leading-relaxed text-foreground">{currentPrompt?.text}</p>
              {currentPrompt?.hint && (
                <p className="text-xs text-muted-foreground">Sheet hint: {currentPrompt.hint}</p>
              )}
              {capacity && (
                <p className="text-xs text-muted-foreground">
                  Slots — memories {capacity.memories.filled}/{capacity.memories.max} · skills{' '}
                  {capacity.skills.filled}/{capacity.skills.max} · resources{' '}
                  {capacity.resources.filled}/{capacity.resources.max} · characters{' '}
                  {capacity.characters.filled}/{capacity.characters.max}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="codex-glow"
                  onClick={handleAdvancePrompt}
                  disabled={rolling}
                >
                  {rolling ? 'Rolling…' : 'Advance (d10 − d6)'}
                </Button>
                <Button type="button" variant="outline" onClick={handleTakePrompt}>
                  Log this prompt
                </Button>
                <Button type="button" variant="ghost" onClick={handleDeclinePrompt}>
                  Decline & advance
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
                  className="w-28"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleJumpPrompt}>
                  Go to prompt
                </Button>
              </div>
              <div
                className="min-h-10 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm"
                aria-live="polite"
              >
                {rollReveal ?? (
                  <span className="text-muted-foreground">Navigation roll appears here.</span>
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

export function TyovPlaySurface(props: TyovPlaySurfaceProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-muted-foreground">Loading session…</div>
      }
    >
      <TyovPlaySurfaceInner {...props} />
    </Suspense>
  );
}
