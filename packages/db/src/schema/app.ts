import type { CharacterSheetField, DiceFormula, LibraryTableRow } from '@codex/schemas';
import { boolean, customType, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const characterSheets = pgTable('character_sheets', {
  id: uuid('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  gameSystemId: text('game_system_id').notNull(),
  fields: jsonb('fields').notNull().$type<CharacterSheetField[]>(),
  originSystemId: text('origin_system_id'),
  lineageSheetId: uuid('lineage_sheet_id'),
  portraitUrl: text('portrait_url'),
  layout: jsonb('layout').$type<{ hiddenFieldKeys: string[]; fieldLabels?: Record<string, string> }>(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const playSessions = pgTable('play_sessions', {
  id: uuid('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  gameSystemId: text('game_system_id').notNull(),
  name: text('name'),
  characterId: uuid('character_id'),
  sceneFocus: text('scene_focus'),
  gameState: jsonb('game_state').$type<Record<string, unknown>>(),
  roomId: text('room_id'),
  chapterNumber: integer('chapter_number'),
  status: text('status'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => playSessions.id, { onDelete: 'cascade' }),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  tags: jsonb('tags').$type<string[]>(),
  pinned: boolean('pinned').default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const savedTags = pgTable('saved_tags', {
  id: uuid('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  color: text('color'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const diceSets = pgTable('dice_sets', {
  id: uuid('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  formulas: jsonb('formulas').notNull().$type<DiceFormula[]>(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const playerNotes = pgTable('player_notes', {
  id: uuid('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  roomId: text('room_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const libraryTables = pgTable('library_tables', {
  id: uuid('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  systemId: text('system_id'),
  category: text('category').notNull(),
  description: text('description'),
  rows: jsonb('rows').notNull().$type<LibraryTableRow[]>(),
  sourceTemplateId: text('source_template_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

/** Live Yjs document blobs (roomId or roomId::gm-secrets). Used by sync-server. */
export const yjsDocuments = pgTable('yjs_documents', {
  name: text('name').primaryKey(),
  state: customType<{ data: Buffer; driverData: Buffer }>({
    dataType() {
      return 'bytea';
    },
  })('state').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

/** Durable invite tokens for play rooms (sync-server). */
export const roomInvites = pgTable('room_invites', {
  roomId: text('room_id').primaryKey(),
  token: text('token').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

/** Account-owned lobby index for cross-device table resume. */
export const playRooms = pgTable('play_rooms', {
  roomId: text('room_id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name'),
  gameSystemId: text('game_system_id'),
  inviteToken: text('invite_token'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});
