import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(64),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const SessionModeSchema = z.enum(['solo', 'hosted', 'peer']);
export type SessionMode = z.infer<typeof SessionModeSchema>;

export const SessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(128),
  mode: SessionModeSchema,
  gameSystemId: z.string().min(1),
  ownerId: z.string().min(1),
  participantIds: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Session = z.infer<typeof SessionSchema>;

export const CharacterSheetFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'textarea', 'select', 'checkbox', 'list']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
});

export const GameSystemIdSchema = z.enum([
  'generic',
  'loner',
  'totv',
  'snallygaster',
  'muscadines',
  'ironforge',
]);

export type GameSystemId = z.infer<typeof GameSystemIdSchema>;

export const CharacterSheetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(128),
  gameSystemId: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  ownerId: z.string().min(1),
  fields: z.array(CharacterSheetFieldSchema),
  /** First system this character was created in — preserved across adaptations */
  originSystemId: GameSystemIdSchema.optional(),
  /** Sheet this character was adapted from (cross-play lineage) */
  lineageSheetId: z.string().uuid().optional(),
  /** Token / portrait image URL (uploaded via assets API) */
  portraitUrl: z.string().url().optional(),
  /** Generic builder: keys hidden from the editor UI */
  layout: z
    .object({
      hiddenFieldKeys: z.array(z.string()),
      fieldLabels: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CharacterSheet = z.infer<typeof CharacterSheetSchema>;
export type CharacterSheetField = z.infer<typeof CharacterSheetFieldSchema>;

export const JournalEntryTypeSchema = z.enum(['scene', 'oracle', 'twist', 'risk', 'note']);
export type JournalEntryType = z.infer<typeof JournalEntryTypeSchema>;

const TagSchema = z.string().min(1).max(32);

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: JournalEntryTypeSchema,
  content: z.string().min(1).max(4096),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(TagSchema).max(16).optional(),
  pinned: z.boolean().optional(),
  createdAt: z.string().datetime(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const PlaySessionStatusSchema = z.enum(['open', 'closed']);
export type PlaySessionStatus = z.infer<typeof PlaySessionStatusSchema>;

export const PlaySessionSchema = z.object({
  id: z.string().uuid(),
  gameSystemId: GameSystemIdSchema,
  ownerId: z.string().min(1),
  name: z.string().min(1).max(128).optional(),
  characterId: z.string().uuid().optional(),
  sceneFocus: z.string().max(512).optional(),
  /** System-specific session state (vow progress, camp week, etc.) */
  gameState: z.record(z.string(), z.unknown()).optional(),
  /** Live table this chapter was closed from — enables chapter listing + reopen */
  roomId: z.string().optional(),
  chapterNumber: z.number().int().min(1).optional(),
  /** Informational only — a table's live log is always the "open" chapter */
  status: PlaySessionStatusSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PlaySession = z.infer<typeof PlaySessionSchema>;

export const PlaySessionLogEntryTypeSchema = z.enum([
  'roll',
  'journal',
  'system',
  'oracle',
  'twist',
  'risk',
  'scene',
  'note',
]);
export type PlaySessionLogEntryType = z.infer<typeof PlaySessionLogEntryTypeSchema>;

export const PlaySessionLogEntrySchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().min(1).max(128),
  type: PlaySessionLogEntryTypeSchema,
  content: z.string().min(1).max(4096),
  author: z.string().min(1).max(64).optional(),
  notation: z.string().max(64).optional(),
  total: z.number().optional(),
  tags: z.array(TagSchema).max(16).optional(),
  pinned: z.boolean().optional(),
  createdAt: z.string().datetime(),
});

export type PlaySessionLogEntry = z.infer<typeof PlaySessionLogEntrySchema>;

/** Persistent table/campaign metadata synced via Yjs (solo or multiplayer). */
export const TableMetaSchema = z.object({
  gameSystemId: GameSystemIdSchema,
  name: z.string().max(128).optional(),
  characterId: z.string().uuid().optional(),
  sceneFocus: z.string().max(512).optional(),
  /** Owner id (account or local) of the table GM — first claim wins, transferable */
  gmUserId: z.string().min(1).optional(),
  /** Secret invite token required to join via PartyKit relay */
  inviteToken: z.string().min(16).max(128).optional(),
  gameState: z.record(z.string(), z.unknown()).optional(),
  /** Chapter counter for this table's live log — bumped each time a chapter is closed */
  chapterNumber: z.number().int().min(1).optional(),
});

export type TableMeta = z.infer<typeof TableMetaSchema>;

export const DiceFormulaSchema = z.object({
  label: z.string().min(1).max(64),
  notation: z.string().min(1).max(64),
});

export type DiceFormula = z.infer<typeof DiceFormulaSchema>;

export const DiceSetSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().min(1),
  name: z.string().min(1).max(128),
  formulas: z.array(DiceFormulaSchema).min(1).max(32),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DiceSet = z.infer<typeof DiceSetSchema>;

export const SavedTagSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().min(1),
  label: TagSchema,
  color: z.string().max(32).optional(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime(),
});

export type SavedTag = z.infer<typeof SavedTagSchema>;

/**
 * A player's private note about a table. Deliberately kept out of the shared
 * Yjs table doc — Yjs replicates full document state to every connected
 * peer, so anything written there is visible to everyone at the table
 * regardless of UI labeling. Real privacy means it never leaves the owning
 * player's own sync path (local Dexie + their own authenticated cloud sync).
 */
export const PlayerNoteSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().min(1),
  roomId: z.string().min(1).max(128),
  content: z.string().min(1).max(4096),
  createdAt: z.string().datetime(),
});

export type PlayerNote = z.infer<typeof PlayerNoteSchema>;

export const LibraryTableRowSchema = z.object({
  roll: z.number().int().optional(),
  label: z.string().max(128).optional(),
  text: z.string().max(4096),
});

export type LibraryTableRow = z.infer<typeof LibraryTableRowSchema>;

export const LibraryTableCategorySchema = z.enum([
  'oracle-likelihood',
  'twist',
  'scene-prompt',
  'prompt-journal',
  'mentor',
  'table',
  'forge',
]);

export type LibraryTableCategory = z.infer<typeof LibraryTableCategorySchema>;

export const UserLibraryTableSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().min(1),
  name: z.string().min(1).max(128),
  systemId: GameSystemIdSchema.optional(),
  category: LibraryTableCategorySchema,
  description: z.string().max(512).optional(),
  rows: z.array(LibraryTableRowSchema).min(1).max(200),
  sourceTemplateId: z.string().max(128).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserLibraryTable = z.infer<typeof UserLibraryTableSchema>;
