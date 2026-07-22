'use client';

import { lookupTable, resolveYesNoOracle, rollDiceNotation } from '@codex/game-engine';
import type { OracleLikelihood, OracleLikelihoodId, OracleTableEntry } from '@codex/game-systems';
import { Button, Textarea } from '@codex/ui';
import { useCallback, useState } from 'react';
import type { TablePanelProps } from './table-panel-types';
import { TableSection } from './table-section';

interface OracleTwistSectionProps
  extends Pick<TablePanelProps, 'onAppendLog' | 'logAuthor' | 'activeCharacter'> {
  oracleLikelihoods?: OracleLikelihood[];
  twistTable?: OracleTableEntry[];
  oracleDice?: string;
  twistDice?: string;
}

/**
 * "Stuck mid-scene, no scripted prompt left" fallback — shared across every
 * system panel that has oracle-likelihood + twist data. Extracted so ToTV
 * and Muscadines don't each
 * duplicate the same ~60 lines already written once for the generic panel.
 */
export function OracleTwistSection({
  oracleLikelihoods,
  twistTable,
  oracleDice = '1d6',
  twistDice = '1d6',
  onAppendLog,
  logAuthor = 'You',
  activeCharacter,
}: OracleTwistSectionProps) {
  const [question, setQuestion] = useState('');
  const [likelihood, setLikelihood] = useState<OracleLikelihoodId>('even');
  const [oracleReveal, setOracleReveal] = useState<string | null>(null);
  const [twistReveal, setTwistReveal] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleAskOracle = useCallback(() => {
    if (!question.trim() || !oracleLikelihoods?.length) return;
    setRolling(true);
    setOracleReveal(null);

    window.setTimeout(() => {
      const likelihoodConfig = oracleLikelihoods.find((l) => l.id === likelihood) ?? oracleLikelihoods[0]!;
      const die = rollDiceNotation(oracleDice).groups[0]?.rolls[0]?.value ?? 1;
      const result = resolveYesNoOracle(die, likelihoodConfig.threshold);
      const answer = result.answer === 'yes' ? 'Yes' : 'No';
      const prefix = activeCharacter ? `[${activeCharacter.name}] ` : '';
      const text = `${prefix}${question.trim()} → ${answer} (rolled ${result.roll}, needed ≤${result.threshold})`;

      setOracleReveal(text);
      onAppendLog({ type: 'oracle', content: text, author: logAuthor });
      setRolling(false);
    }, 480);
  }, [activeCharacter, likelihood, logAuthor, onAppendLog, oracleDice, oracleLikelihoods, question]);

  const handleTwist = useCallback(() => {
    if (!twistTable?.length) return;
    const die = rollDiceNotation(twistDice).groups[0]?.rolls[0]?.value ?? 1;
    const twist = lookupTable(twistTable, die);
    const text = `Twist (${die}): ${twist.entry}`;
    setTwistReveal(text);
    onAppendLog({ type: 'twist', content: text, author: logAuthor });
  }, [logAuthor, onAppendLog, twistDice, twistTable]);

  if (!oracleLikelihoods?.length && !twistTable?.length) return null;

  return (
    <TableSection
      title="Oracle"
      description="Stuck with no prompt in hand? Ask a yes/no question or pull a twist."
      defaultOpen={false}
    >
      {oracleLikelihoods?.length ? (
        <>
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
          <div className="min-h-10 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs" aria-live="polite">
            {oracleReveal ?? <span className="text-muted-foreground">Answer appears here and in the log.</span>}
          </div>
        </>
      ) : null}

      {twistTable?.length ? (
        <>
          <Button type="button" variant="outline" size="sm" onClick={handleTwist}>
            Pull a twist ({twistDice})
          </Button>
          <div className="min-h-10 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs" aria-live="polite">
            {twistReveal ?? <span className="text-muted-foreground">Twist appears here and in the log.</span>}
          </div>
        </>
      ) : null}
    </TableSection>
  );
}
