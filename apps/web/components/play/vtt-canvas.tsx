'use client';

import { CodexMapToolbar } from '@/components/play/codex-map-toolbar';
import { useYjsExcalidraw } from '@/hooks/use-yjs-excalidraw';
import { createCodexSymbolElements } from '@/lib/map-symbols';
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
  /** Hide terrain/structure palette (e.g. compact solo panel). */
  showToolbar?: boolean;
}

export function VttCanvas({ doc, showToolbar = true }: VttCanvasProps) {
  const { ready, initialElements, onChange, bindApi } = useYjsExcalidraw(doc);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [activeStamp, setActiveStamp] = useState<string | null>(null);
  const activeStampRef = useRef<string | null>(null);

  useEffect(() => {
    activeStampRef.current = activeStamp;
  }, [activeStamp]);

  const handleApi = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api;
      bindApi(api);
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
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || !activeStamp) return;

    const unsubscribe = api.onPointerUp((activeTool, pointerDownState) => {
      if (!activeStampRef.current) return;
      const { x, y } = pointerDownState.origin;
      placeStampAt(x, y);
    });

    return unsubscribe;
  }, [activeStamp, placeStampAt]);

  useEffect(() => {
    if (!activeStamp) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveStamp(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeStamp]);

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
        <CodexMapToolbar activeStamp={activeStamp} onStampSelect={setActiveStamp} />
      ) : null}
      <div
        className={[
          'relative min-h-0 flex-1',
          activeStamp ? 'cursor-crosshair' : '',
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
      </div>
    </div>
  );
}
