'use client';

import { CodexMapToolbar } from '@/components/play/codex-map-toolbar';
import { FogOverlay } from '@/components/play/fog-overlay';
import { useYjsExcalidraw } from '@/hooks/use-yjs-excalidraw';
import { useYjsFog } from '@/hooks/use-yjs-fog';
import { sceneBoundsFromDrag } from '@/lib/map-bounds';
import {
  createCodexSymbolElements,
  isFogTool,
  type CodexMapTool,
} from '@/lib/map-symbols';
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
  /** Use floating in-canvas toolbar (play rooms). */
  floatingToolbar?: boolean;
}

export function VttCanvas({
  doc,
  showToolbar = true,
  floatingToolbar = false,
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

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    activeStampRef.current = activeStamp;
  }, [activeStamp]);

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
    const created = await createCodexSymbolElements(stampId, bounds);
    const existing = api.getSceneElements();
    api.updateScene({ elements: [...existing, ...created] });
    setActiveStamp(null);
    setActiveTool('select');
  }, []);

  const handleMapPointerDrag = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const tool = activeToolRef.current;
      if (tool === 'stamp' && activeStampRef.current) {
        void placeStampInBounds(x1, y1, x2, y2);
        return;
      }
      if (tool === 'fog-hide') {
        paintRectAtScene(x1, y1, x2, y2, 'hide');
        return;
      }
      if (tool === 'fog-reveal') {
        paintRectAtScene(x1, y1, x2, y2, 'reveal');
      }
    },
    [paintRectAtScene, placeStampInBounds],
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

  const mapCursor =
    activeTool === 'stamp' && activeStamp
      ? 'cursor-crosshair'
      : isFogTool(activeTool)
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
          onClearFog={clearAllFog}
        />
      ) : null}
      <div
        className={[
          'relative min-h-0 flex-1',
          mapCursor,
          '[&_.excalidraw]:!h-full',
          '[&_.excalidraw-wrapper]:!h-full',
        ].join(' ')}
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
        <FogOverlay api={apiRef.current} hiddenCells={hiddenCells} />
        {showToolbar && floatingToolbar ? (
          <CodexMapToolbar
            variant="floating"
            collapsed={toolbarCollapsed}
            onToggleCollapse={() => setToolbarCollapsed((open) => !open)}
            activeTool={activeTool}
            activeStamp={activeStamp}
            onSelectTool={setActiveTool}
            onStampSelect={setActiveStamp}
            onClearFog={clearAllFog}
          />
        ) : null}
      </div>
    </div>
  );
}
