import { describe, expect, it } from 'vitest';
import { exportTableToSoloSession } from './export-table-session';

describe('exportTableToSoloSession', () => {
  it('maps table meta and log into a solo session archive', () => {
    const { session, journalEntries } = exportTableToSoloSession(
      {
        gameSystemId: 'loner',
        name: 'Night run',
        sceneFocus: 'Rooftop',
        gameState: { promptIndex: 3 },
      },
      [
        {
          id: 'log-1',
          roomId: 'room-a',
          type: 'oracle',
          content: 'Yes — but',
          author: 'Host',
          createdAt: '2025-06-24T12:00:00.000Z',
        },
      ],
      'owner-1',
    );

    expect(session.gameSystemId).toBe('loner');
    expect(session.sceneFocus).toBe('Rooftop');
    expect(journalEntries).toHaveLength(1);
    expect(journalEntries[0]?.content).toContain('Host');
  });

  it('maps roll and system log lines to journal notes', () => {
    const { journalEntries } = exportTableToSoloSession(
      { gameSystemId: 'ironforge', name: 'Forge' },
      [
        {
          id: 'log-roll',
          roomId: 'room-a',
          type: 'roll',
          content: 'd20 = 14',
          createdAt: '2025-06-24T12:00:00.000Z',
        },
        {
          id: 'log-system',
          roomId: 'room-a',
          type: 'system',
          content: 'Heat +1',
          createdAt: '2025-06-24T12:01:00.000Z',
        },
      ],
      'owner-1',
    );

    expect(journalEntries.map((entry) => entry.type)).toEqual(['note', 'note']);
  });
});
