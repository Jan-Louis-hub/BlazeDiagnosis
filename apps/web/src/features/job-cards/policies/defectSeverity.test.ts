import { describe, expect, it } from 'vitest';

import {
  DEFECT_SEVERITIES,
  getDefectSeverityMeta,
  resolveDefectSeverity,
} from './defectSeverity';

describe('defectSeverity policy', () => {
  it('resolves supported normal, advisory, and critical values including casing and whitespace', () => {
    expect(resolveDefectSeverity('normal')).toBe('normal');
    expect(resolveDefectSeverity('  ADVISORY ')).toBe('advisory');
    expect(resolveDefectSeverity('Critical')).toBe('critical');
  });

  it('fails safe to unknown rather than normal for missing, null, or unsupported values', () => {
    expect(resolveDefectSeverity(undefined)).toBe('unknown');
    expect(resolveDefectSeverity(null)).toBe('unknown');
    expect(resolveDefectSeverity('')).toBe('unknown');
    expect(resolveDefectSeverity('   ')).toBe('unknown');
    expect(resolveDefectSeverity('severe')).toBe('unknown');
    expect(resolveDefectSeverity('high')).toBe('unknown');
    expect(resolveDefectSeverity(1)).toBe('unknown');
    expect(resolveDefectSeverity({ severity: 'normal' })).toBe('unknown');
  });

  it('provides distinct labels, icons, descriptions, and known flags for all tiers', () => {
    const knownMeta = DEFECT_SEVERITIES.map((tier) => getDefectSeverityMeta(tier));
    const unknownMeta = getDefectSeverityMeta('unexpected-value');

    expect(knownMeta.every((item) => item.isKnownSeverity)).toBe(true);
    expect(unknownMeta.isKnownSeverity).toBe(false);
    expect(unknownMeta.severity).toBe('unknown');
    expect(unknownMeta.label).toBe('Unknown Severity');

    const labels = [...knownMeta, unknownMeta].map((item) => item.label);
    const icons = [...knownMeta, unknownMeta].map((item) => item.iconKey);
    const descriptions = [...knownMeta, unknownMeta].map((item) => item.description);

    expect(new Set(labels).size).toBe(4);
    expect(new Set(icons).size).toBe(4);
    expect(new Set(descriptions).size).toBe(4);
    expect(descriptions.every((text) => text.trim().length > 0)).toBe(true);
  });
});