'use client';

import { lookupTable, resolveYesNoOracle, rollDiceNotation, tableMaxRoll } from '@codex/game-engine';
import { getGameSystem, getSheetFieldValue } from '@codex/game-systems';
import { Button, Card, CardHeader, CardTitle, Input, Textarea } from '@codex/ui';
import { useCallback, useEffect, useState } from 'react';
import {
  patchGameState,
  readGameStateNumber,
  saveGameStateIndex,
  type TablePanelProps,
} from './table-panel-types';
import { TableSection } from './table-section';

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
  const folklore = engine?.folkloreTables;
  const mentorPrompts = engine?.mentorPrompts ?? [];

  const [sceneFocus, setSceneFocus] = useState(meta.sceneFocus ?? '');
  const [question, setQuestion] = useState('');
  const [oracleReveal, setOracleReveal] = useState<string | null>(null);
  const [recipeNotes, setRecipeNotes] = useState(
    activeCharacter ? getSheetFieldValue(activeCharacter, 'recipe_notes') : '',
  );

  const mentorIndex = readGameStateNumber(meta, 'mentorIndex', 0);
  const scenePromptIndex = readGameStateNumber(meta, 'scenePromptIndex', 0);
  const currentMentor = mentorPrompts[mentorIndex % (mentorPrompts.length || 1)];

  useEffect(() => {
    setSceneFocus(meta.sceneFocus ?? '');
  }, [meta.sceneFocus]);

  useEffect(() => {
    setRecipeNotes(activeCharacter ? getSheetFieldValue(activeCharacter, 'recipe_notes') : '');
  }, [activeCharacter]);

  const handleSceneBlur = useCallback(() => {
    if (sceneFocus !== (meta.sceneFocus ?? '')) onUpdateMeta({ sceneFocus });
  }, [meta.sceneFocus, onUpdateMeta, sceneFocus]);

  const saveRecipeNotes = useCallback(async () => {
    if (!onPatchCharacter || !activeCharacter) return;
    await onPatchCharacter((sheet) => ({
      ...sheet,
      fields: sheet.fields.map((field) =>
        field.key === 'recipe_notes' ? { ...field, value: recipeNotes } : field,
      ),
      updatedAt: new Date().toISOString(),
    }));
    onAppendLog({ type: 'note', content: 'Recipe notes saved to character sheet.', author: logAuthor });
  }, [activeCharacter, logAuthor, onAppendLog, onPatchCharacter, recipeNotes]);

  const handleMentorPrompt = useCallback(() => {
    if (!mentorPrompts.length) return;
    const prompt = mentorPrompts[mentorIndex % mentorPrompts.length]!;
    const next = (mentorIndex + 1) % mentorPrompts.length;
    saveGameStateIndex(meta, onUpdateMeta, 'mentorIndex', next);
    onAppendLog({ type: 'scene', content: `${prompt.label}: ${prompt.text}`, author: logAuthor });
  }, [logAuthor, mentorIndex, mentorPrompts, meta, onAppendLog, onUpdateMeta]);

  const handleScenePrompt = useCallback(() => {
    if (!engine?.scenePrompts.length) return;
    const prompt = engine.scenePrompts[scenePromptIndex % engine.scenePrompts.length]!;
    const next = scenePromptIndex + 1;
    saveGameStateIndex(meta, onUpdateMeta, 'scenePromptIndex', next);
    onAppendLog({ type: 'scene', content: prompt, author: logAuthor });
  }, [engine?.scenePrompts, logAuthor, meta, onAppendLog, onUpdateMeta, scenePromptIndex]);

  const handleOracle = useCallback(() => {
    if (!question.trim() || !engine?.oracleLikelihoods || !engine.oracleDice) return;
    const likelihoodConfig = engine.oracleLikelihoods.find((l) => l.id === 'even')!;
    const die = rollDiceNotation(engine.oracleDice).groups[0]?.rolls[0]?.value ?? 1;
    const result = resolveYesNoOracle(die, likelihoodConfig.threshold);
    const text = `${question.trim()} → ${result.answer === 'yes' ? 'Yes' : 'No'} (${result.roll} ≤ ${result.threshold})`;
    setOracleReveal(text);
    onAppendLog({ type: 'oracle', content: text, author: logAuthor });
  }, [engine?.oracleDice, engine?.oracleLikelihoods, logAuthor, onAppendLog, question]);

  if (!engine || engine.kind !== 'mentor') return null;

  return (
    <Card
      className="overflow-hidden border-codex-border/60 bg-codex-surface/80"
      data-testid="table-muscadines-panel"
    >
      <CardHeader className="border-b border-codex-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name} · Grove</CardTitle>
      </CardHeader>

      <TableSection title="Season">
        <Input
          value={sceneFocus}
          onChange={(e) => setSceneFocus(e.target.value)}
          onBlur={handleSceneBlur}
          placeholder="Late harvest, thunder week, first frost…"
          className="text-sm"
        />
        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleScenePrompt}>
          Draw a scene prompt →
        </Button>
      </TableSection>

      <TableSection title="Mentor" description={currentMentor?.label}>
        <p className="text-sm leading-relaxed text-codex-text">{currentMentor?.text}</p>
        <Button type="button" size="sm" variant="secondary" onClick={handleMentorPrompt}>
          Next mentor prompt
        </Button>
      </TableSection>

      <TableSection title="Recipe notes">
        <Textarea
          value={recipeNotes}
          onChange={(e) => setRecipeNotes(e.target.value)}
          rows={3}
          className="text-sm"
          placeholder="Ingredients, stir-counts, warnings in the margin…"
        />
        <Button
          type="button"
          size="sm"
          disabled={!activeCharacter || !onPatchCharacter}
          onClick={() => void saveRecipeNotes()}
          data-testid="muscadines-save-recipe"
        >
          Save to character
        </Button>
      </TableSection>

      {folklore?.groveOmens?.length || folklore?.jarResults?.length ? (
        <TableSection title="Folklore" defaultOpen={false}>
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
                  const text = `Grove omen (${die}): ${omen.entry}`;
                  setOracleReveal(text);
                  onAppendLog({ type: 'scene', content: text, author: logAuthor });
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
                  const die = rollDiceNotation(`1d${max}`).groups[0]?.rolls[0]?.value ?? 1;
                  const result = lookupTable(folklore.jarResults!, die);
                  const text = `Jar result (${die}): ${result.entry}`;
                  setOracleReveal(text);
                  onAppendLog({ type: 'oracle', content: text, author: logAuthor });
                }}
              >
                Jar result
              </Button>
            ) : null}
          </div>
        </TableSection>
      ) : null}

      <TableSection title="Oracle" defaultOpen={false}>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the grove a yes/no question…"
          className="text-sm"
        />
        <Button type="button" size="sm" onClick={handleOracle} disabled={!question.trim()}>
          Ask oracle
        </Button>
        <div className="min-h-8 rounded-md border border-codex-border/40 bg-codex-void/40 px-3 py-2 text-xs">
          {oracleReveal ?? <span className="text-codex-text-muted">Oracle answers appear here.</span>}
        </div>
      </TableSection>
    </Card>
  );
}
