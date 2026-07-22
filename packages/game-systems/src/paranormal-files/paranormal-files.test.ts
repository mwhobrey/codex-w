import { describe, expect, it } from 'vitest';
import { applyUnknownThreshold, flattenD66, pfConceptGrid } from './tables';
import { paranormalFilesPlugin } from './index';

describe('paranormalFilesPlugin', () => {
  it('shares loner-oracle engine with shadow-ops config', () => {
    expect(paranormalFilesPlugin.soloEngine?.kind).toBe('loner-oracle');
    expect(paranormalFilesPlugin.soloEngine?.paranormalFiles?.unknownThresholdMax).toBe(6);
    expect(paranormalFilesPlugin.soloEngine?.paranormalFiles?.factions).toHaveLength(6);
    expect(paranormalFilesPlugin.soloEngine?.paranormalFiles?.realityFractureTable).toHaveLength(6);
  });

  it('creates an agent sheet with Loner tags', () => {
    const sheet = paranormalFilesPlugin.createEmptySheet('Agent Vale', 'owner-1');
    expect(sheet.gameSystemId).toBe('paranormal-files');
    expect(sheet.fields.find((f) => f.key === 'concept')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'luck')?.value).toBe(6);
  });
});

describe('applyUnknownThreshold', () => {
  it('applies deltas and flags fracture at max', () => {
    expect(applyUnknownThreshold(0, 'Yes, and...')).toEqual({ next: 0, fracture: false });
    expect(applyUnknownThreshold(2, 'No')).toEqual({ next: 5, fracture: false });
    expect(applyUnknownThreshold(3, 'No')).toEqual({ next: 6, fracture: true });
    expect(applyUnknownThreshold(5, 'No, and...')).toEqual({ next: 6, fracture: true });
  });
});

describe('flattenD66', () => {
  it('produces 36 concept rows', () => {
    expect(flattenD66(pfConceptGrid)).toHaveLength(36);
    expect(flattenD66(pfConceptGrid)[0]).toEqual({ roll: 11, text: 'Cynical Agent' });
  });
});
