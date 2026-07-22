import { describe, expect, it } from 'vitest';
import {
  snallygasterPlugin,
  resolveSnallygasterNumber,
  driftSkillAfterFailure,
  skillFromStyleSpecialty,
} from './index';

describe('snallygasterPlugin', () => {
  it('ships official Camp Snallygaster tables', () => {
    expect(snallygasterPlugin.soloEngine?.kind).toBe('lasers-feelings');
    const lf = snallygasterPlugin.soloEngine?.lasersFeelings;
    expect(lf?.mischiefTable).toHaveLength(40);
    expect(lf?.monstrousTable).toHaveLength(20);
    expect(lf?.monsterTable).toHaveLength(12);
    expect(lf?.campLeaderTable).toHaveLength(12);
    expect(lf?.activityTable).toHaveLength(12);
    expect(lf?.decisionOracleTable).toHaveLength(6);
    expect(snallygasterPlugin.soloEngine?.mentorPrompts?.length).toBeGreaterThanOrEqual(10);
  });

  it('creates a counselor sheet with Skill', () => {
    const sheet = snallygasterPlugin.createEmptySheet('Casey', 'owner-1');
    expect(sheet.gameSystemId).toBe('snallygaster');
    expect(sheet.fields.find((f) => f.key === 'number')?.value).toBe(3);
    expect(sheet.fields.find((f) => f.key === 'style')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'camper_name')).toBeDefined();
  });

  it('computes Skill from Style + Specialty', () => {
    const sheet = snallygasterPlugin.createEmptySheet('Casey', 'owner-1');
    sheet.fields = sheet.fields.map((f) => {
      if (f.key === 'style') {
        return {
          ...f,
          value: 'Jumps off cliffs before checking the water',
        };
      }
      if (f.key === 'specialty') {
        return { ...f, value: 'Survival' };
      }
      return f;
    });
    expect(skillFromStyleSpecialty(sheet)).toBe(5);
  });

  it('drifts Skill after failure', () => {
    const sheet = snallygasterPlugin.createEmptySheet('Casey', 'owner-1');
    const afterMonster = driftSkillAfterFailure(sheet, 'monster');
    expect(resolveSnallygasterNumber(afterMonster)).toBe(2);
    const afterCounselor = driftSkillAfterFailure(sheet, 'counselor');
    expect(resolveSnallygasterNumber(afterCounselor)).toBe(4);
  });
});
