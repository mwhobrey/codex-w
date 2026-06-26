import type { LibraryCategory, LibraryEntry } from '@codex/game-systems';
import type { UserLibraryTable } from '@codex/schemas';

const PROSE_CATEGORIES: LibraryCategory[] = [
  'scene-prompt',
  'prompt-journal',
  'mentor',
  'table',
  'forge',
];

const PROSE_PLACEHOLDER = 'Add from your book…';

export function shouldBlankProseOnClone(category: LibraryCategory): boolean {
  return PROSE_CATEGORIES.includes(category);
}

export function cloneLibraryEntryToUserTable(
  entry: LibraryEntry,
  ownerId: string,
): UserLibraryTable {
  const now = new Date().toISOString();
  const blankProse = shouldBlankProseOnClone(entry.category);

  return {
    id: crypto.randomUUID(),
    ownerId,
    name: `My ${entry.title}`,
    systemId: entry.systemId,
    category: entry.category,
    description: entry.description,
    sourceTemplateId: entry.id,
    rows: entry.rows.map((row) => ({
      roll: row.roll,
      label: row.label,
      text: blankProse ? PROSE_PLACEHOLDER : row.text,
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyUserLibraryTable(ownerId: string, name: string): UserLibraryTable {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ownerId,
    name,
    category: 'table',
    rows: [{ text: 'Result 1' }],
    createdAt: now,
    updatedAt: now,
  };
}
