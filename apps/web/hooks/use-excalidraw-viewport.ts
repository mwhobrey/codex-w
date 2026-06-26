'use client';

import type { ExcalidrawViewport } from '@/lib/excalidraw-viewport-math';
import { sceneCoordsToViewportCoords } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useEffect, useState, type RefObject } from 'react';

export type { ExcalidrawViewport } from '@/lib/excalidraw-viewport-math';
export { excalidrawSceneTransform } from '@/lib/excalidraw-viewport-math';

const DEFAULT_VIEWPORT: ExcalidrawViewport = {
  scrollX: 0,
  scrollY: 0,
  zoom: 1,
  anchorX: 0,
  anchorY: 0,
};

function readViewport(
  api: ExcalidrawImperativeAPI,
  anchorEl: Element | null,
): ExcalidrawViewport {
  const state = api.getAppState();
  const anchorRect = anchorEl?.getBoundingClientRect();
  return {
    scrollX: state.scrollX,
    scrollY: state.scrollY,
    zoom: state.zoom.value,
    anchorX: anchorRect ? state.offsetLeft - anchorRect.left : 0,
    anchorY: anchorRect ? state.offsetTop - anchorRect.top : 0,
  };
}

/** Scene point → overlay-local pixels (uses Excalidraw's own projection). */
export function sceneToOverlayPoint(
  sceneX: number,
  sceneY: number,
  api: ExcalidrawImperativeAPI,
  anchorEl: Element | null,
): { x: number; y: number } {
  const state = api.getAppState();
  const anchorRect = anchorEl?.getBoundingClientRect();
  const anchorLeft = anchorRect?.left ?? state.offsetLeft;
  const anchorTop = anchorRect?.top ?? state.offsetTop;
  const { x, y } = sceneCoordsToViewportCoords({ sceneX, sceneY }, state);
  return {
    x: x - anchorLeft,
    y: y - anchorTop,
  };
}

export function useExcalidrawViewport(
  api: ExcalidrawImperativeAPI | null,
  anchorRef?: RefObject<Element | null>,
): ExcalidrawViewport {
  const [viewport, setViewport] = useState<ExcalidrawViewport>(DEFAULT_VIEWPORT);

  useEffect(() => {
    if (!api) return;

    let frame = 0;
    let running = true;

    const sync = () => {
      const next = readViewport(api, anchorRef?.current ?? null);
      setViewport((prev) => {
        if (
          prev.scrollX === next.scrollX &&
          prev.scrollY === next.scrollY &&
          prev.zoom === next.zoom &&
          prev.anchorX === next.anchorX &&
          prev.anchorY === next.anchorY
        ) {
          return prev;
        }
        return next;
      });
    };

    const tick = () => {
      if (!running) return;
      sync();
      frame = requestAnimationFrame(tick);
    };

    sync();
    frame = requestAnimationFrame(tick);

    const unsubScroll = api.onScrollChange(sync);

    const root = document.querySelector('.excalidraw');
    let observer: ResizeObserver | undefined;
    if (root && 'ResizeObserver' in window) {
      observer = new ResizeObserver(sync);
      observer.observe(root);
    }
    if (anchorRef?.current && 'ResizeObserver' in window) {
      observer ??= new ResizeObserver(sync);
      observer.observe(anchorRef.current);
    }

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      unsubScroll();
      observer?.disconnect();
    };
  }, [api, anchorRef]);

  return viewport;
}
