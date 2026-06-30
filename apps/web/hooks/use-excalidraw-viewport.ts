'use client';

import {
  type ExcalidrawViewport,
  sceneToOverlayPoint as mathSceneToOverlayPoint,
} from '@/lib/excalidraw-viewport-math';
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

/** Scene point → overlay-local pixels (uses local math projection, no static excalidraw import). */
export function sceneToOverlayPoint(
  sceneX: number,
  sceneY: number,
  api: ExcalidrawImperativeAPI,
  anchorEl: Element | null,
): { x: number; y: number } {
  const state = api.getAppState();
  const anchorRect = anchorEl?.getBoundingClientRect();
  const viewport = {
    scrollX: state.scrollX,
    scrollY: state.scrollY,
    zoom: state.zoom.value,
    anchorX: anchorRect ? state.offsetLeft - anchorRect.left : 0,
    anchorY: anchorRect ? state.offsetTop - anchorRect.top : 0,
  };
  return mathSceneToOverlayPoint(sceneX, sceneY, viewport);
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

    // Cache anchor offsets to avoid layout thrashing in the rAF loop
    const cachedAnchor = { x: 0, y: 0 };

    const updateAnchor = () => {
      const anchorEl = anchorRef?.current ?? null;
      const state = api.getAppState();
      const anchorRect = anchorEl?.getBoundingClientRect();
      cachedAnchor.x = anchorRect ? state.offsetLeft - anchorRect.left : 0;
      cachedAnchor.y = anchorRect ? state.offsetTop - anchorRect.top : 0;
    };

    const sync = () => {
      updateAnchor();
      const state = api.getAppState();
      setViewport({
        scrollX: state.scrollX,
        scrollY: state.scrollY,
        zoom: state.zoom.value,
        anchorX: cachedAnchor.x,
        anchorY: cachedAnchor.y,
      });
    };

    const tick = () => {
      if (!running) return;
      const state = api.getAppState();
      setViewport((prev) => {
        if (
          prev.scrollX === state.scrollX &&
          prev.scrollY === state.scrollY &&
          prev.zoom === state.zoom.value &&
          prev.anchorX === cachedAnchor.x &&
          prev.anchorY === cachedAnchor.y
        ) {
          return prev;
        }
        return {
          scrollX: state.scrollX,
          scrollY: state.scrollY,
          zoom: state.zoom.value,
          anchorX: cachedAnchor.x,
          anchorY: cachedAnchor.y,
        };
      });
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

