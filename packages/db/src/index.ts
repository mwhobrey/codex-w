export { getDb, isDatabaseConfigured, type CodexDb } from './client';
export * from './schema';
export {
  deleteCharacterSheet,
  getCharacterSheetById,
  listCharacterSheetsByOwner,
  upsertCharacterSheet,
} from './character-sheets';
export {
  deleteDiceSet,
  getDiceSetById,
  listDiceSetsByOwner,
  upsertDiceSet,
} from './dice-sets';
export {
  deleteLibraryTable,
  getLibraryTableById,
  listLibraryTablesByOwner,
  upsertLibraryTable,
} from './library-tables';
export {
  getPlaySessionById,
  listJournalEntriesByOwner,
  listJournalEntriesBySession,
  listPlaySessionsByOwner,
  listPlaySessionsByRoom,
  searchJournalEntries,
  upsertJournalEntry,
  upsertPlaySession,
  type JournalSearchOptions,
} from './play-sessions';
export {
  deleteSavedTag,
  getSavedTagById,
  listSavedTagsByOwner,
  upsertSavedTag,
} from './saved-tags';
export {
  appendPlayerNote,
  deletePlayerNote,
  listPlayerNotesByOwner,
  listPlayerNotesByRoom,
} from './player-notes';
export {
  deletePlayRoom,
  getPlayRoomById,
  listPlayRoomsByOwner,
  upsertPlayRoom,
} from './play-rooms';
export {
  getRoomInviteToken,
  seedRoomInviteToken,
  type SeedRoomInviteResult,
} from './room-invites';
export {
  fetchYjsDocument,
  storeYjsDocument,
  toYjsStateBytes,
  fromYjsStateBytes,
} from './yjs-documents';
