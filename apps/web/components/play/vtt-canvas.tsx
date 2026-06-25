'use client';

import { CodexMapToolbar } from '@/components/play/codex-map-toolbar';
import { FogOverlay } from '@/components/play/fog-overlay';
import { MapCursorOverlay } from '@/components/play/map-cursor-overlay';
import type { TablePeer } from '@/hooks/use-table-awareness';
import { useYjsExcalidraw } from '@/hooks/use-yjs-excalidraw';
import { useYjsFog } from '@/hooks/use-yjs-fog';
import { sceneBoundsFromDrag } from '@/lib/map-bounds';
import { MAP_TEMPLATES } from '@/lib/map-templates';
import {
  createCodexSymbolElements,
  isFogTool,
  type CodexMapTool,
  type CodexTokenOptions,
} from '@/lib/map-symbols';
import type { MapViewRole } from '@/lib/table-systems';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as Y from 'yjs';
import '@excalidraw/excalidraw/index.css';

const Excalidraw = dynamic(
  async () => {
    const mod = await import('@excalidraw/excalidraw');
    return mod.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-codex-void text-sm text-codex-text-muted">
        Loading map…
      </div>
    ),
  },
);

interface VttCanvasProps {
  doc: Y.Doc | null;
  showToolbar?: boolean;
  floatingToolbar?: boolean;
  playMode?: boolean;
  mapRole?: MapViewRole;
  onMapRoleChange?: (role: MapViewRole) => void;
  tokenOptions?: CodexTokenOptions;
  peers?: TablePeer[];
  onPointerScene?: (point: { x: number; y: number } | null) => void;
}

export function VttCanvas({
  doc,
  showToolbar = true,
  floatingToolbar = false,
  playMode = false,
  mapRole = 'gm',
  onMapRoleChange,
  tokenOptions,
  peers = [],
  onPointerScene,
}: VttCanvasProps) {
  const { ready, initialElements, onChange, bindApi } = useYjsExcalidraw(doc);
  const { hiddenCells, paintRectAtScene, clearAllFog } = useYjsFog(doc);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [activeTool, setActiveTool] = useState<CodexMapTool>('select');
  const [activeStamp, setActiveStamp] = useState<string | null>(null);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(floatingToolbar);
  const activeToolRef = useRef(activeTool);
  const activeStampRef = useRef<string | null>(null);
  const tokenOptionsRef = useRef(tokenOptions);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    activeStampRef.current = activeStamp;
  }, [activeStamp]);

  useEffect(() => {
    tokenOptionsRef.current = tokenOptions;
  }, [tokenOptions]);

  useEffect(() => {
    if (activeStamp || isFogTool(activeTool)) {
      setToolbarCollapsed(false);
    }
  }, [activeStamp, activeTool]);

  const handleApi = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api;
      bindApi(api);
      setApiReady(true);
    },
    [bindApi],
  );

  const placeStampInBounds = useCallback(async (x1: number, y1: number, x2: number, y2: number) => {
    const stampId = activeStampRef.current;
    const api = apiRef.current;
    if (!stampId || !api) return;

    const bounds = sceneBoundsFromDrag(x1, y1, x2, y2);
    const isToken = stampId.startsWith('token-');
    const created = await createCodexSymbolElements(
      stampId,
      bounds,
      isToken ? tokenOptionsRef.current : undefined,
    );
    const existing = api.getSceneElements();
    api.updateScene({ elements: [...existing, ...created] });
    setActiveStamp(null);
    setActiveTool('select');
  }, []);

  const applyTemplate = useCallback(
    async (templateId: string) => {
      const api = apiRef.current;
      const template = MAP_TEMPLATES.find((item) => item.id === templateId);
      if (!api || !template) return;

      const created = (
        await Promise.all(template.stamps.map((stamp) => createCodexSymbolElements(stamp.symbolId, stamp.bounds)))
      ).flat();
      const existing = api.getSceneElements();
      api.updateScene({ elements: [...existing, ...created] });
    },
    [],
  );

  const handleMapPointerDrag = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const tool = activeToolRef.current;
      if (tool === 'stamp' && activeStampRef.current) {
        void placeStampInBounds(x1, y1, x2, y2);
        return;
      }
      if (mapRole !== 'gm') return;
      if (tool === 'fog-hide') {
        paintRectAtScene(x1, y1, x2, y2, 'hide');
        return;
      }
      if (tool === 'fog-reveal') {
        paintRectAtScene(x1, y1, x2, y2, 'reveal');
      }
    },
    [mapRole, paintRectAtScene, placeStampInBounds],
  );

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const needsPointer =
      activeTool === 'stamp' || activeTool === 'fog-hide' || activeTool === 'fog-reveal';
    if (!needsPointer) return;

    const unsubscribe = api.onPointerUp((_activeTool, pointerDownState) => {
      const tool = activeToolRef.current;
      if (tool === 'select') return;
      if (tool === 'stamp' && !activeStampRef.current) return;
      const { x: x1, y: y1 } = pointerDownState.origin;
      const { x: x2, y: y2 } = pointerDownState.lastCoords;
      handleMapPointerDrag(x1, y1, x2, y2);
    });

    return unsubscribe;
  }, [activeTool, activeStamp, handleMapPointerDrag, apiReady]);

  useEffect(() => {
    const needsEscape = activeStamp || isFogTool(activeTool);
    if (!needsEscape) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setActiveStamp(null);
      setActiveTool('select');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeStamp, activeTool]);

  useEffect(() => {
    if (!onPointerScene) return;
    const onMove = (event: PointerEvent) => {
      const api = apiRef.current;
      if (!api) return;
      const rect = api.getAppState();
      const canvas = document.querySelector('.excalidraw canvas.interactive');
      if (!(canvas instanceof HTMLCanvasElement)) return;
      const bounds = canvas.getBoundingClientRect();
      const x = (event.clientX - bounds.left - rect.scrollX) / rect.zoom.value;
      const y = (event.clientY - bounds.top - rect.scrollY) / rect.zoom.value;
      if (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
        onPointerScene({ x, y });
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [onPointerScene, apiReady]);

  const mapCursor =
    activeTool === 'stamp' && activeStamp
      ? 'cursor-crosshair'
      : isFogTool(activeTool) && mapRole === 'gm'
        ? 'cursor-cell'
        : '';

  if (!doc || !ready) {
    return (
      <div className="flex h-full items-center justify-center bg-codex-void text-sm text-codex-text-muted">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col" data-testid="vtt-canvas">
      {showToolbar && !floatingToolbar ? (
        <CodexMapToolbar
          activeTool={activeTool}
          activeStamp={activeStamp}
          onSelectTool={setActiveTool}
          onStampSelect={setActiveStamp}
          onClearFog={mapRole === 'gm' ? clearAllFog : undefined}
          mapRole={mapRole}
          onMapRoleChange={onMapRoleChange}
          onApplyTemplate={applyTemplate}
          templates={MAP_TEMPLATES}
        />
      ) : null}
      <div
        className={[
          'relative min-h-0 flex-1',
          mapCursor,
          '[&_.excalidraw]:!h-full',
          '[&_.excalidraw-wrapper]:!h-full',
          playMode && '[&_.App-toolbar]:!hidden',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Excalidraw
          excalidrawAPI={handleApi}
          initialData={{ elements: [...initialElements], scrollToContent: true }}
          onChange={onChange}
          gridModeEnabled
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
            },
          }}
        />
        <FogOverlay api={apiRef.current} hiddenCells={hiddenCells} mapRole={mapRole} />
        <MapCursorOverlay api={apiRef.current} peers={peers} />
        {showToolbar && floatingToolbar ? (
          <CodexMapToolbar
            variant="floating"
            collapsed={toolbarCollapsed}
            onToggleCollapse={() => setToolbarCollapsed((open) => !open)}
            activeTool={activeTool}
            activeStamp={activeStamp}
            onSelectTool={setActiveTool}
            onStampSelect={setActiveStamp}
            onClearFog={mapRole === 'gm' ? clearAllFog : undefined}
            mapRole={mapRole}
            onMapRoleChange={onMapRoleChange}
            onApplyTemplate={applyTemplate}
            templates={MAP_TEMPLATES}
          />
        ) : null}
      </div>
    </div>
  );
}
