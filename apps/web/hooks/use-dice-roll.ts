'use client';

import { parseDiceNotation, rollDiceNotation, DiceParseError, type RollResult } from '@codex/game-engine';
import { useCallback, useRef, useState } from 'react';

const DEFAULT_PRESETS = [
  { label: 'd20', notation: 'd20' },
  { label: 'Adv', notation: 'd20adv' },
  { label: 'Dis', notation: 'd20dis' },
  { label: '2d6', notation: '2d6' },
  { label: '4d6kh3', notation: '4d6kh3' },
  { label: '4dF', notation: '4dF' },
] as const;

export interface DicePreset {
  label: string;
  notation: string;
}

export function useDiceRoll(initialNotation = 'd20') {
  const [notation, setNotation] = useState(initialNotation);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const liveRef = useRef<HTMLDivElement>(null);

  const roll = useCallback(
    (notationOverride?: string) => {
      const activeNotation = notationOverride ?? notation;
      setError(null);
      setRolling(true);

      window.setTimeout(() => {
        try {
          const rolled = rollDiceNotation(activeNotation);
          setResult(rolled);
          setHistory((prev) => [rolled, ...prev].slice(0, 20));
          if (notationOverride) setNotation(notationOverride);
          liveRef.current?.focus();
        } catch (err) {
          setError(err instanceof DiceParseError ? err.message : 'Invalid notation');
          setResult(null);
        } finally {
          setRolling(false);
        }
      }, 520);
    },
    [notation],
  );

  const validateNotation = useCallback((value: string): string | null => {
    try {
      parseDiceNotation(value);
      return null;
    } catch (err) {
      return err instanceof DiceParseError ? err.message : 'Invalid notation';
    }
  }, []);

  return {
    notation,
    setNotation,
    rolling,
    error,
    result,
    history,
    liveRef,
    roll,
    validateNotation,
    defaultPresets: DEFAULT_PRESETS,
  };
}
