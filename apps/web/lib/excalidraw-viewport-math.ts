export interface ExcalidrawViewport {
  scrollX: number;
  scrollY: number;
  zoom: number;
  /** excalidraw container screen left minus overlay anchor screen left */
  anchorX: number;
  /** excalidraw container screen top minus overlay anchor screen top */
  anchorY: number;
}

/** SVG group transform for scene-space children inside an anchored overlay. */
export function excalidrawSceneTransform(viewport: ExcalidrawViewport): string {
  const { scrollX, scrollY, zoom, anchorX, anchorY } = viewport;
  return `translate(${anchorX + scrollX * zoom} ${anchorY + scrollY * zoom}) scale(${zoom})`;
}

/** Translates scene coordinates to overlay-local SVG coordinates. */
export function sceneToOverlayPoint(
  sceneX: number,
  sceneY: number,
  viewport: ExcalidrawViewport,
): { x: number; y: number } {
  return {
    x: (sceneX + viewport.scrollX) * viewport.zoom + viewport.anchorX,
    y: (sceneY + viewport.scrollY) * viewport.zoom + viewport.anchorY,
  };
}

/** Translates screen client coordinates to scene-space coordinates. */
export function viewportToScenePoint(
  clientX: number,
  clientY: number,
  viewport: ExcalidrawViewport,
  anchorLeft: number,
  anchorTop: number,
): { x: number; y: number } {
  return {
    x: (clientX - anchorLeft - viewport.anchorX) / viewport.zoom - viewport.scrollX,
    y: (clientY - anchorTop - viewport.anchorY) / viewport.zoom - viewport.scrollY,
  };
}

