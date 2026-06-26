'use client';

import type { RollResult } from '@codex/game-engine';
import { getGameSystem } from '@codex/game-systems';
import { claimTableGmIfVacant, ensureTableInviteToken, importSoloSessionToTable, journalRepo, soloSessionRepo, transferTableGm } from '@codex/sync';
import { Button, cn } from '@codex/ui';
import { CharacterPicker, useCharacter } from '@/components/solo/character-picker';
import { useOwnerId } from '@/hooks/use-owner-id';
import { usePlayRoom } from '@/hooks/use-play-room';
import { useTableAwareness } from '@/hooks/use-table-awareness';
import { useTableMeta } from '@/hooks/use-table-meta';
import { useTableCharacterPatch } from '@/hooks/use-table-character-patch';
import { useTableSidebarWidth } from '@/hooks/use-table-sidebar-width';
import { useSession } from '@/lib/auth-client';
import { MAP_FLOATING_BOTTOM_STYLE } from '@/lib/map-overlay-layout';
import { createPlayRoomUrl } from '@/lib/play-room';
import { recordRecentPlayRoom } from '@/lib/recent-play-rooms';
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';
import { writeStoredTableInvite } from '@/lib/table-invite-storage';
import { parseGameSystemId, type MapViewRole } from '@/lib/table-systems';
import { isTableGm, resolveFogViewRole } from '@/lib/table-gm';
import { userDisplayName } from '@/lib/user-display-name';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CharacterPeekDrawer } from './character-peek-drawer';
import { FloatingDiceWidget } from './floating-dice-widget';
import { PlayDicePanel } from './play-dice-panel';
import { SessionLogPanel } from './session-log-panel';
import { TableExportPanel } from './table-export-panel';
import { TableGmControl } from './table-gm-control';
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
  inviteToken?: string;
}

type MobileView = 'map' | TableSidebarTab;

export function PlayRoomSurface({
  roomId,
  initialSystem,
  importSessionId,
  inviteToken,
}: PlayRoomSurfaceProps) {
  const systemSeed = parseGameSystemId(initialSystem);
  const [partyInvite, setPartyInvite] = useState(() => resolvePlayRoomInvite(roomId, inviteToken));
  const { doc, awareness, logEntries, connectionStatus, appendLog, ready, resolvedInvite } =
    usePlayRoom(roomId, partyInvite);
  const { meta, updateMeta } = useTableMeta(doc, {
    initialSystem: systemSeed,
    initialInviteToken: partyInvite ?? inviteToken,
  });

  useLayoutEffect(() => {
    if (inviteToken) writeStoredTableInvite(roomId, inviteToken);
  }, [inviteToken, roomId]);

  useEffect(() => {
    const next = resolvePlayRoomInvite(roomId, inviteToken, meta?.inviteToken);
    if (next && next !== partyInvite) setPartyInvite(next);
  }, [inviteToken, meta?.inviteToken, partyInvite, roomId]);
  const { ownerId, ready: ownerReady } = useOwnerId();
  const { data: authSession } = useSession();
  const accountDisplayName = authSession?.user ? userDisplayName(authSession.user) : undefined;
  const { width: sidebarWidth, adjustWidth } = useTableSidebarWidth();
  const awarenessState = useTableAwareness(awareness, {
    accountDisplayName,
    accountId: authSession?.user?.id,
    ownerId: ownerReady ? ownerId : undefined,
  });
  const [gmPreviewAsPlayer, setGmPreviewAsPlayer] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('map');
  const [sidebarTab, setSidebarTab] = useState<TableSidebarTab>('play');
  const [tableNameDraft, setTableNameDraft] = useState('');
  const [peekOpen, setPeekOpen] = useState(false);
  const [peekHighlightField, setPeekHighlightField] = useState<string | undefined>();
  const importStartedRef = useRef(false);

  const localCharacterId =
    awarenessState.localCharacterId ?? meta?.characterId ?? readStoredCharacterId(roomId);
  const activeCharacter = useCharacter(localCharacterId);
  const { patchCharacter } = useTableCharacterPatch(localCharacterId);
  const isSoloAtTable = awarenessState.peers.filter((peer) => !peer.isSelf).length === 0;
  const inviteUrl = useMemo(
    () =>
      createPlayRoomUrl(
        roomId,
        meta?.gameSystemId,
        meta?.inviteToken ?? resolvedInvite ?? partyInvite ?? inviteToken,
      ),
    [inviteToken, meta?.gameSystemId, meta?.inviteToken, partyInvite, resolvedInvite, roomId],
  );

  const plugin = useMemo(
    () => (meta ? getGameSystem(meta.gameSystemId) : null),
    [meta],
  );

  const tableGm = isTableGm(meta, ownerId);
  const mapRole = resolveFogViewRole(meta, ownerId, gmPreviewAsPlayer);
  const logAuthor = awarenessState.localName.trim() || 'You';

  useEffect(() => {
    if (!ready || !doc) return;
    const token = inviteToken ?? resolvedInvite ?? partyInvite ?? meta?.inviteToken;
    if (token) {
      ensureTableInviteToken(doc, token);
      writeStoredTableInvite(roomId, token);
    }
  }, [doc, inviteToken, meta?.inviteToken, partyInvite, ready, resolvedInvite, roomId]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    const token = inviteToken ?? resolvedInvite ?? partyInvite ?? meta?.inviteToken;
    if (!token) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('invite')) return;
    url.searchParams.delete('invite');
    window.history.replaceState(null, '', url.toString());
  }, [inviteToken, meta?.inviteToken, partyInvite, ready, resolvedInvite]);

  useEffect(() => {
    if (!ready || !ownerReady || !doc || !ownerId) return;
    claimTableGmIfVacant(doc, ownerId);
  }, [doc, ownerId, ownerReady, ready]);

  useEffect(() => {
    if (!tableGm && gmPreviewAsPlayer) setGmPreviewAsPlayer(false);
  }, [gmPreviewAsPlayer, tableGm]);

  const handleMapRoleChange = useCallback(
    (role: MapViewRole) => {
      if (!tableGm) return;
      setGmPreviewAsPlayer(role === 'player');
    },
    [tableGm],
  );

  const handleTransferGm = useCallback(
    (toUserId: string) => {
      if (!doc || !ownerId) return;
      transferTableGm(doc, ownerId, toUserId);
      setGmPreviewAsPlayer(false);
    },
    [doc, ownerId],
  );

  const activeSidebarTab: TableSidebarTab =
    mobileView === 'map' ? sidebarTab : mobileView;

  const showMap = mobileView === 'map';

  const systemDicePresets = plugin?.dicePresets ?? [];

  const openCharacterPeek = useCallback((highlightFieldKey?: string) => {
    setPeekHighlightField(highlightFieldKey);
    setPeekOpen(true);
  }, []);

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
      recordRecentPlayRoom(
        roomId,
        meta.name,
        meta.gameSystemId,
        meta.inviteToken ?? resolvedInvite ?? partyInvite ?? inviteToken,
      );
    }
  }, [inviteToken, ready, roomId, meta?.name, meta?.gameSystemId, meta?.inviteToken, partyInvite, resolvedInvite]);

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
      recordRecentPlayRoom(
        roomId,
        nextMeta.name,
        nextMeta.gameSystemId,
        nextMeta.inviteToken ?? inviteToken,
      );
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
        author: logAuthor,
      });
    },
    [appendLog, logAuthor],
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
            onClick={() => openCharacterPeek()}
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
          logAuthor={logAuthor}
          onPatchCharacter={patchCharacter}
          onOpenCharacterPeek={openCharacterPeek}
        />
      ) : null}

      {ownerReady && meta ? (
        <TableExportPanel meta={meta} logEntries={logEntries} ownerId={ownerId} />
      ) : null}

      {meta ? (
        <TableScratchNotes meta={meta} onSave={(scratchNotes) => updateMeta({ scratchNotes })} />
      ) : null}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-background" data-testid="play-room-surface">
      <TableHeader
        tableName={tableNameDraft}
        onTableNameChange={setTableNameDraft}
        onTableNameSave={saveTableName}
        roomId={roomId}
        roomUrl={inviteUrl}
        systemName={plugin?.name}
        connectionStatus={connectionStatus}
        presence={
          <>
            {ownerReady ? (
              <TableGmControl
                isGm={tableGm}
                gmUserId={meta?.gmUserId}
                ownerId={ownerId}
                peers={awarenessState.peers}
                onTransfer={handleTransferGm}
              />
            ) : null}
            <TablePresence
              peers={awarenessState.peers}
              localName={awarenessState.localName}
              localCharacterName={activeCharacter?.name}
              gmUserId={meta?.gmUserId}
              usesAccountName={awarenessState.usesAccountName}
              onLocalNameChange={awarenessState.setLocalName}
            />
          </>
        }
      />

      <div
        className="flex shrink-0 gap-1 border-b border-border/40 p-1.5 lg:hidden"
        role="tablist"
        aria-label="Table views"
      >
        {(['map', 'play', 'dice', 'log'] as const).map((view) => (
          <button
            key={view}
            type="button"
            role="tab"
            id={`table-mobile-tab-${view}`}
            aria-selected={mobileView === view}
            aria-controls={view === 'map' ? 'table-map-panel' : 'table-sidebar-panel'}
            onClick={() => setMobileView(view)}
            className={cn(
              'min-h-10 flex-1 rounded-md px-2 py-2 text-sm font-medium capitalize transition-colors',
              mobileView === view
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:bg-background/50',
            )}
          >
            {view}
          </button>
        ))}
      </div>

      {!ready ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Syncing table…
        </div>
      ) : (
        <div
          className="flex min-h-0 flex-1"
          style={{ '--table-sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
        >
          <div
            id="table-map-panel"
            role="tabpanel"
            aria-labelledby="table-mobile-tab-map"
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
              isTableGm={tableGm}
              onMapRoleChange={tableGm ? handleMapRoleChange : undefined}
              tokenOptions={tokenOptions}
              peers={awarenessState.peers}
              localClientId={awarenessState.clientId}
              onPointerScene={awarenessState.setCursor}
            />
            <FloatingDiceWidget onRoll={handleDiceRoll} systemPresets={systemDicePresets} />
          </div>

          <TableResizeHandle onResize={adjustWidth} />

          <aside
            className={cn(
              'flex min-h-0 w-full shrink-0 flex-col border-border/40 lg:w-[var(--table-sidebar-width)] lg:border-l',
              showMap ? 'hidden lg:flex' : 'flex',
            )}
          >
            <TableSidebarTabs
              activeTab={activeSidebarTab}
              onTabChange={selectSidebarTab}
              className="hidden lg:flex"
            />

            <div
              id="table-sidebar-panel"
              role="tabpanel"
              aria-labelledby={`table-mobile-tab-${activeSidebarTab}`}
              className="min-h-0 flex-1 overflow-y-auto p-3"
            >
              {activeSidebarTab === 'play' ? playPanel : null}
              {activeSidebarTab === 'dice' ? (
                <PlayDicePanel onRoll={handleDiceRoll} systemPresets={systemDicePresets} />
              ) : null}
              {activeSidebarTab === 'log' ? (
                <SessionLogPanel entries={logEntries} onAppend={appendLog} logAuthor={logAuthor} />
              ) : null}
            </div>
          </aside>
        </div>
      )}

      <CharacterPeekDrawer
        open={peekOpen}
        onClose={() => {
          setPeekOpen(false);
          setPeekHighlightField(undefined);
        }}
        character={activeCharacter}
        highlightFieldKey={peekHighlightField}
      />
    </div>
  );
}
