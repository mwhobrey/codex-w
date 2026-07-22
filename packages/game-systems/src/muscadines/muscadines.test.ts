import { describe, expect, it } from 'vitest';
import {
  applyBackgroundToSheet,
  getMuscadinesBackground,
  muscadinesBackgrounds,
  muscadinesPlugin,
  quirkOptions,
  resolveMuscadinesCheck,
  startingItemOptions,
  styleOptions,
} from './index';

describe('muscadinesPlugin', () => {
  it('uses mentor solo engine with oracles and chargen tables', () => {
    expect(muscadinesPlugin.soloEngine?.kind).toBe('mentor');
    expect(muscadinesPlugin.soloEngine?.mentorPrompts?.length).toBeGreaterThanOrEqual(10);
    expect(muscadinesPlugin.soloEngine?.oracleLikelihoods).toHaveLength(5);
    expect(muscadinesPlugin.soloEngine?.muscadines?.styles?.length).toBe(styleOptions.length);
    expect(muscadinesPlugin.soloEngine?.muscadines?.quirks?.length).toBe(quirkOptions.length);
    expect(muscadinesPlugin.soloEngine?.muscadines?.startingItems?.length).toBe(
      startingItemOptions.length,
    );
    expect(muscadinesPlugin.soloEngine?.muscadines?.backgrounds?.length).toBe(
      muscadinesBackgrounds.length,
    );
  });

  it('creates a marmateer character sheet with attributes and jar fields', () => {
    const sheet = muscadinesPlugin.createEmptySheet('Rowan', 'owner-1');
    expect(sheet.gameSystemId).toBe('muscadines');
    expect(sheet.fields.find((f) => f.key === 'folk')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'background')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'strength')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'endurance')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'jar_description')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'jar_spells')).toBeDefined();
  });

  it('seeds endurance and protection from a public background', () => {
    const sheet = muscadinesPlugin.createEmptySheet('Tomila', 'owner-1');
    const next = applyBackgroundToSheet(sheet, 'Bramblehand');
    expect(getMuscadinesBackground('Bramblehand')?.endurance).toBe(6);
    expect(next.fields.find((f) => f.key === 'endurance')?.value).toBe(6);
    expect(next.fields.find((f) => f.key === 'protection')?.value).toBe('1d6');
    expect(String(next.fields.find((f) => f.key === 'abilities')?.value)).toContain(
      'Murmurations of Flora',
    );
  });
});

describe('resolveMuscadinesCheck', () => {
  it('scores a success when total meets DR', () => {
    const result = resolveMuscadinesCheck({
      attributeDie: 'd8',
      impactDice: 1,
      cardsToBurn: 0,
      handCards: 2,
      challengeDR: 8,
      challengeRS: 2,
      challengeSuccesses: 0,
      rolls: [5, 4],
    });
    expect(result.success).toBe(true);
    expect(result.setback).toBe(false);
    expect(result.challengeSuccesses).toBe(1);
    expect(result.handCards).toBe(2);
    expect(result.challengeOvercome).toBe(false);
  });

  it('grants a card on setback and can raise DR in festival mode', () => {
    const result = resolveMuscadinesCheck({
      attributeDie: 'd4',
      impactDice: 0,
      cardsToBurn: 0,
      handCards: 1,
      challengeDR: 8,
      challengeRS: 2,
      challengeSuccesses: 0,
      festivalMode: true,
      rolls: [2],
    });
    expect(result.setback).toBe(true);
    expect(result.handCards).toBe(2);
    expect(result.challengeDR).toBe(9);
  });

  it('burns cards for extra impact dice and overcomes when RS is met', () => {
    const result = resolveMuscadinesCheck({
      attributeDie: 'd8',
      impactDice: 1,
      cardsToBurn: 2,
      handCards: 3,
      challengeDR: 10,
      challengeRS: 2,
      challengeSuccesses: 1,
      rolls: [7, 3, 4, 2],
    });
    expect(result.cardsBurned).toBe(2);
    expect(result.handCards).toBe(1);
    expect(result.success).toBe(true);
    expect(result.challengeOvercome).toBe(true);
    expect(result.total).toBe(16);
  });
});
