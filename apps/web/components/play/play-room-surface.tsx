'use client';

import type { RollResult } from '@codex/game-engine';
import { getGameSystem } from '@codex/game-systems';
import { importSoloSessionToTable, journalRepo, soloSessionRepo } from '@codex/sync';
import { Button, cn } from '@codex/ui';
import { CharacterPicker, useCharacter } from '@/components/solo/character-picker';
import { useOwnerId } from '@/hooks/use-owner-id';
import { usePlayRoom } from '@/hooks/use-play-room';
import { useTableAwareness } from '@/hooks/use-table-awareness';
import { useTableMeta } from '@/hooks/use-table-meta';
import { useTableSidebarWidth } from '@/hooks/use-table-sidebar-width';
import { MAP_FLOATING_BOTTOM_STYLE } from '@/lib/map-overlay-layout';
import { createPlayRoomUrl } from '@/lib/play-room';
import { recordRecentPlayRoom } from '@/lib/recent-play-rooms';
import { parseGameSystemId } from '@/lib/table-systems';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CharacterPeekDrawer } from './character-peek-drawer';
import { FloatingDiceWidget } from './floating-dice-widget';
import { PlayDicePanel } from './play-dice-panel';
import { SessionLogPanel } from './session-log-panel';
import { TableHeader } from './table-header';
import { TablePlayPanel } from './table-play-panel';
import { TablePresence } from './table-presence';
import { TableResizeHandle } from './table-resize-handle';
import { TableScratchNotes } from './table-scratch-notes';
import { type TableSidebarTab, TableSidebarTabs } from './table-sidebar';
import { VttCanvas } from './vtt-canvas';

const TABLE_CHARACTER_KEY = (roomId: string) => `codex-table-character-${roomId}`;

function readStoredCharacterId(roomId: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(TABLE_CHARACTER_KEY(roomId));
  return stored || undefined;
}

function writeStoredCharacterId(roomId: string, characterId: string | undefined) {
  if (typeof window === 'undefined') return;
  if (characterId) window.localStorage.setItem(TABLE_CHARACTER_KEY(roomId), characterId);
  else window.localStorage.removeItem(TABLE_CHARACTER_KEY(roomId));
}

interface PlayRoomSurfaceProps {
  roomId: string;
  initialSystem?: string;
  importSessionId?: string;
}

type MobileView = 'map' | TableSidebarTab;

export function PlayRoomSurface({ roomId, initialSystem, importSessionId }: PlayRoomSurfaceProps) {
  const systemSeed = parseGameSystemId(initialSystem);
  const { doc, awareness, logEntries, connectionStatus, appendLog, ready } =
    usePlayRoom(roomId);
  const { meta, updateMeta } = useTableMeta(doc, {
    initialSystem: systemSeed,
  });
  const { ownerId, ready: ownerReady } = useOwnerId();
  const { width: sidebarWidth, adjustWidth } = useTableSidebarWidth();
  const awarenessState = useTableAwareness(awareness);
  const [mobileView, setMobileView] = useState<MobileView>('map');
  const [sidebarTab, setSidebarTab] = useState<TableSidebarTab>('play');
  const [tableNameDraft, setTableNameDraft] = useState('');
  const [peekOpen, setPeekOpen] = useState(false);
  const importStartedRef = useRef(false);

  const localCharacterId =
    awarenessState.localCharacterId ?? meta?.characterId ?? readStoredCharacterId(roomId);
  const activeCharacter = useCharacter(localCharacterId);
  const isSoloAtTable = awarenessState.peers.filter((peer) => !peer.isSelf).length === 0;
  const inviteUrl = useMemo(
    () => createPlayRoomUrl(roomId, meta?.gameSystemId),
    [meta?.gameSystemId, roomId],
  );

  const plugin = useMemo(
    () => (meta ? getGameSystem(meta.gameSystemId) : null),
    [meta],
  );

  const mapRole = awarenessState.localMapRole;

  const activeSidebarTab: TableSidebarTab =
    mobileView === 'map' ? sidebarTab : mobileView;

  const showMap = mobileView === 'map';

  const tokenOptions = useMemo(
    () =>
      activeCharacter
        ? {
            characterId: activeCharacter.id,
            characterName: activeCharacter.name,
            label: activeCharacter.name.slice(0, 2).toUpperCase(),
          }
        : undefined,
    [activeCharacter],
  );

  useEffect(() => {
    if (ready && meta) {
      recordRecentPlayRoom(roomId, meta.name, meta.gameSystemId);
    }
  }, [ready, roomId, meta?.name, meta?.gameSystemId]);

  useEffect(() => {
    setTableNameDraft(meta?.name ?? '');
  }, [meta?.name]);

  useEffect(() => {
    awarenessState.setCharacterName(activeCharacter?.name);
  }, [activeCharacter?.name, awarenessState.setCharacterName]);

  useEffect(() => {
    if (!ready || awarenessState.localCharacterId) return;
    const seed = meta?.characterId ?? readStoredCharacterId(roomId);
    if (seed) awarenessState.setCharacterId(seed);
  }, [awarenessState.localCharacterId, awarenessState.setCharacterId, meta?.characterId, ready, roomId]);

  useEffect(() => {
    if (!ready || !doc || !importSessionId || importStartedRef.current) return;
    importStartedRef.current = true;

    void (async () => {
      const session = await soloSessionRepo.get(importSessionId);
      if (!session) return;
      const entries = await journalRepo.listBySession(importSessionId);
      const nextMeta = importSoloSessionToTable(doc, roomId, session, entries);
      if (session.characterId) {
        awarenessState.setCharacterId(session.characterId);
        writeStoredCharacterId(roomId, session.characterId);
      }
      recordRecentPlayRoom(roomId, nextMeta.name, nextMeta.gameSystemId);
    })();
  }, [
    awarenessState.setCharacterId,
    doc,
    importSessionId,
    ready,
    roomId,
  ]);

  const handleCharacterChange = useCallback(
    (characterId: string | undefined) => {
      awarenessState.setCharacterId(characterId);
      writeStoredCharacterId(roomId, characterId);
      if (isSoloAtTable) updateMeta({ characterId });
    },
    [awarenessState, isSoloAtTable, roomId, updateMeta],
  );

  const handleDiceRoll = useCallback(
    (result: RollResult) => {
      appendLog({
        type: 'roll',
        content: `${result.notation} → ${result.total}`,
        notation: result.notation,
        total: result.total,
        author: 'You',
      });
    },
    [appendLog],
  );

  const saveTableName = useCallback(() => {
    const trimmed = tableNameDraft.trim();
    if (trimmed !== (meta?.name ?? '')) {
      updateMeta({ name: trimmed || undefined });
    }
  }, [meta?.name, tableNameDraft, updateMeta]);

  const selectSidebarTab = (tab: TableSidebarTab) => {
    setSidebarTab(tab);
    setMobileView(tab);
  };

  const playPanel = (
    <div className="space-y-3">
      {ownerReady && meta ? (
        <div className="space-y-2">
          <CharacterPicker
            ownerId={ownerId}
            value={localCharacterId}
            preferredSystemId={meta.gameSystemId}
            variant="compact"
            onChange={handleCharacterChange}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            disabled={!localCharacterId}
            onClick={() => setPeekOpen(true)}
            data-testid="character-peek-button"
          >
            {activeCharacter ? `Peek · ${activeCharacter.name}` : 'Peek character'}
          </Button>
        </div>
      ) : null}

      {meta ? (
        <TablePlayPanel
          gameSystemId={meta.gameSystemId}
          meta={meta}
          onUpdateMeta={updateMeta}
          onAppendLog={appendLog}
          activeCharacter={activeCharacter}
        />
      ) : null}

      {meta ? (
        <TableScratchNotes meta={meta} onSave={(scratchNotes) => updateMeta({ scratchNotes })} />
      ) : null}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-codex-void" data-testid="play-room-surface">
      <TableHeader
        tableName={tableNameDraft}
        onTableNameChange={setTableNameDraft}
        onTableNameSave={saveTableName}
        roomId={roomId}
        roomUrl={inviteUrl}
        systemName={plugin?.name}
        connectionStatus={connectionStatus}
        presence={
          <TablePresence
            peers={awarenessState.peers}
            localName={awarenessState.localName}
            onLocalNameChange={awarenessState.setLocalName}
          />
        }
      />

      <div className="flex shrink-0 gap-1 border-b border-codex-border/40 p-1.5 lg:hidden">
        {(['map', 'play', 'dice', 'log'] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setMobileView(view)}
            className={cn(
              'min-h-10 flex-1 rounded-md px-2 py-2 text-sm font-medium capitalize transition-colors',
              mobileView === view
                ? 'bg-codex-ember/20 text-codex-ember'
                : 'text-codex-text-muted hover:bg-codex-void/50',
            )}
          >
            {view}
          </button>
        ))}
      </div>

      {!ready ? (
        <div className="flex flex-1 items-center justify-center text-sm text-codex-text-muted">
          Syncing table…
        </div>
      ) : (
        <div
          className="flex min-h-0 flex-1"
          style={{ '--table-sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
        >
          <div
            className={cn(
              'relative min-h-0 min-w-0 flex-1',
              !showMap && 'hidden lg:block',
            )}
            style={MAP_FLOATING_BOTTOM_STYLE}
          >
            <VttCanvas
              doc={doc}
              floatingToolbar
              playMode
              mapRole={mapRole}
              onMapRoleChange={awarenessState.setMapRole}
              tokenOptions={tokenOptions}
              peers={awarenessState.peers}
              onPointerScene={awarenessState.setCursor}
            />
            <FloatingDiceWidget onRoll={handleDiceRoll} />
          </div>

          <TableResizeHandle onResize={adjustWidth} />

          <aside
            className={cn(
              'flex min-h-0 w-full shrink-0 flex-col border-codex-border/40 lg:w-[var(--table-sidebar-width)] lg:border-l',
              showMap ? 'hidden lg:flex' : 'flex',
            )}
          >
            <TableSidebarTabs
              activeTab={activeSidebarTab}
              onTabChange={selectSidebarTab}
              className="hidden lg:flex"
            />

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {activeSidebarTab === 'play' ? playPanel : null}
              {activeSidebarTab === 'dice' ? (
                <PlayDicePanel onRoll={handleDiceRoll} />
              ) : null}
              {activeSidebarTab === 'log' ? (
                <SessionLogPanel entries={logEntries} onAppend={appendLog} />
              ) : null}
            </div>
          </aside>
        </div>
      )}

      <CharacterPeekDrawer
        open={peekOpen}
        onClose={() => setPeekOpen(false)}
        character={activeCharacter}
      />
    </div>
  );
}
