import type { CharacterSheetField, DiceFormula, LibraryTableRow } from '@codex/schemas';
import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
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

export const soloSessions = pgTable('solo_sessions', {
  id: uuid('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  gameSystemId: text('game_system_id').notNull(),
  name: text('name'),
  characterId: uuid('character_id'),
  sceneFocus: text('scene_focus'),
  gameState: jsonb('game_state').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => soloSessions.id, { onDelete: 'cascade' }),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
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
