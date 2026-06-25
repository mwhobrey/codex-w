'use client';

import { CodexMapToolbar } from '@/components/play/codex-map-toolbar';
import { FogOverlay } from '@/components/play/fog-overlay';
import { useYjsExcalidraw } from '@/hooks/use-yjs-excalidraw';
import { useYjsFog } from '@/hooks/use-yjs-fog';
import { createCodexSymbolElements, isFogTool, type CodexMapTool } from '@/lib/map-symbols';
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
}

export function VttCanvas({ doc, showToolbar = true }: VttCanvasProps) {
  const { ready, initialElements, onChange, bindApi } = useYjsExcalidraw(doc);
  const { hiddenCells, paintAtScene, clearAllFog } = useYjsFog(doc);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [activeTool, setActiveTool] = useState<CodexMapTool>('select');
  const [activeStamp, setActiveStamp] = useState<string | null>(null);
  const activeToolRef = useRef(activeTool);
  const activeStampRef = useRef<string | null>(null);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    activeStampRef.current = activeStamp;
  }, [activeStamp]);

  const handleApi = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api;
      bindApi(api);
      setApiReady(true);
    },
    [bindApi],
  );

  const placeStampAt = useCallback(async (sceneX: number, sceneY: number) => {
    const stampId = activeStampRef.current;
    const api = apiRef.current;
    if (!stampId || !api) return;

    const created = await createCodexSymbolElements(stampId, sceneX, sceneY);
    const existing = api.getSceneElements();
    api.updateScene({ elements: [...existing, ...created] });
    setActiveStamp(null);
    setActiveTool('select');
  }, []);

  const handleMapPointer = useCallback(
    (sceneX: number, sceneY: number) => {
      const tool = activeToolRef.current;
      if (tool === 'stamp' && activeStampRef.current) {
        void placeStampAt(sceneX, sceneY);
        return;
      }
      if (tool === 'fog-hide') {
        paintAtScene(sceneX, sceneY, 'hide', 1);
        return;
      }
      if (tool === 'fog-reveal') {
        paintAtScene(sceneX, sceneY, 'reveal', 1);
      }
    },
    [paintAtScene, placeStampAt],
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
      const { x, y } = pointerDownState.origin;
      handleMapPointer(x, y);
    });

    return unsubscribe;
  }, [activeTool, activeStamp, handleMapPointer, apiReady]);

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
    <div className="flex h-full w-full flex-col" data-testid="vtt-canvas">
      {showToolbar ? (
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
      </div>
    </div>
  );
}
