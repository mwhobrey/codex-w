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
