export interface SceneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_STAMP_SIZE = 80;
const MIN_DRAG_PX = 10;

export function sceneBoundsFromDrag(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  defaultSize = DEFAULT_STAMP_SIZE,
): SceneBounds {
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  if (width < MIN_DRAG_PX && height < MIN_DRAG_PX) {
    return {
      x: x1 - defaultSize / 2,
      y: y1 - defaultSize / 2,
      width: defaultSize,
      height: defaultSize,
    };
  }

  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.max(width, MIN_DRAG_PX),
    height: Math.max(height, MIN_DRAG_PX),
  };
}

export function centerOfBounds(bounds: SceneBounds): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}
