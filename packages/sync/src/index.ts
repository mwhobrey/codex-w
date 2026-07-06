export {
  exportTableToPlaySession,
  type ExportTableToPlaySessionOptions,
} from './export-table-session';
export { characterSheetRepo, isCharacterSheetDeleted } from './character-sheets';
export { characterPortraitRepo, type CharacterPortraitRecord } from './character-portraits';
export { diceSetRepo } from './dice-sets';
export { userLibraryTableRepo } from './user-library-tables';
export { journalRepo, playSessionRepo } from './play-sessions';
export { savedTagRepo } from './saved-tags';
export { playerNoteRepo } from './player-notes';
export { diceRollHistoryRepo } from './dice-roll-history';
export type { DiceRollHistoryEntry } from './db';
export { CodexDatabase, getDatabase, resetDatabaseForTests } from './db';
export {
  PLAY_ROOM_KEYS,
  createPlayRoomDoc,
  getPlayRoomExcalidrawElements,
  getPlayRoomExcalidrawFiles,
  getPlayRoomFogMap,
  getPlayRoomLogArray,
  getPlayRoomMetaMap,
  getPlayRoomPlayerTokensMap,
  type PlayRoomFileRecord,
} from './yjs/play-room-doc';
export {
  claimTableGmIfVacant,
  defaultTableMeta,
  ensureTableInviteToken,
  parseTableMeta,
  patchTableMeta,
  readTableMeta,
  seedTableMetaIfEmpty,
  transferTableGm,
  writeTableMeta,
} from './yjs/table-meta';
export { requestKick } from './yjs/kick-guard';
export {
  INVITE_QUERY_PARAM,
  INVITE_TOKEN_MIN_LENGTH,
  checkRoomInviteAdmission,
  generateInviteToken,
  isValidInviteToken,
  parseInviteFromUri,
  type InviteAdmissionResult,
  resolveTableInviteToken,
  admissionAfterInviteSeed,
} from './room-invite';
export {
  FOG_CELL_SIZE,
  fogCellKey,
  paintFogBrush,
  paintFogRect,
  parseFogCellKey,
  readHiddenFogCells,
  sceneToFogCell,
  isScenePointFogged,
  setFogCellHidden,
} from './yjs/fog';
export {
  applyUpdateRespectingFog,
  captureFogSnapshot,
  connectionIsTableGm,
  fogSnapshotsDiffer,
  PLAY_ROOM_FOG_MAP_KEY,
  PLAY_ROOM_META_MAP_KEY,
  readTableGmUserId,
  restoreFogSnapshot,
  type FogSnapshot,
} from './yjs/fog-guard';
export {
  applyUpdateRespectingLog,
  captureLogSnapshot,
  logSnapshotsDiffer,
  restoreLogSnapshot,
  type LogSnapshot,
} from './yjs/log-guard';
export {
  createPlayRoomProviders,
  hydratePlayRoomIndexedDb,
  type CreatePlayRoomProvidersOptions,
  type PlayRoomConnectionStatus,
  type PlayRoomProviders,
} from './yjs/play-room-providers';
export {
  appendPlayRoomLogEntry,
  patchPlayRoomLogEntry,
  readPlayRoomLogEntries,
} from './yjs/play-room-log';
export {
  importPlaySessionToTable,
  isPlaySessionImported,
  tableMetaFromPlaySession,
} from './yjs/import-play-session';
export {
  closeChapter,
  type CloseChapterResult,
} from './yjs/chapter-lifecycle';
export {
  DEFAULT_PLAYER_TOKEN_RADIUS,
  MAX_PLAYER_TOKEN_RADIUS,
  MIN_PLAYER_TOKEN_RADIUS,
  PLAYER_TOKEN_RADIUS,
  TOKEN_GRID_SIZE,
  defaultPlayerTokenPosition,
  movePlayerToken,
  playerTokenKey,
  prunePlayerTokens,
  readPlayerTokens,
  removePlayerToken,
  snapTokenPosition,
  updatePlayerToken,
  upsertPlayerToken,
  type PlayerTokenRecord,
  type PlayerTokenView,
} from './yjs/player-tokens';
