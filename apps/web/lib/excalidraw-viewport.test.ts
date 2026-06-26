import { describe, expect, it } from 'vitest';
import { excalidrawSceneTransform } from '@/lib/excalidraw-viewport-math';

describe('excalidrawSceneTransform', () => {
  it('projects scene coords into overlay-local space', () => {
    const viewport = {
      scrollX: 120,
      scrollY: -40,
      zoom: 1.5,
      anchorX: 2,
      anchorY: -3,
    };
    const sceneX = 200;
    const sceneY = 96;

    const expectedX = (sceneX + viewport.scrollX) * viewport.zoom + viewport.anchorX;
    const expectedY = (sceneY + viewport.scrollY) * viewport.zoom + viewport.anchorY;

    const transform = excalidrawSceneTransform(viewport);
    const match = transform.match(
      /translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)/,
    );
    expect(match).not.toBeNull();

    const tx = Number(match![1]);
    const ty = Number(match![2]);
    const zoom = Number(match![3]);

    expect(sceneX * zoom + tx).toBeCloseTo(expectedX);
    expect(sceneY * zoom + ty).toBeCloseTo(expectedY);
  });

  it('ignores screen offset when anchor is aligned with excalidraw container', () => {
    const viewport = {
      scrollX: 0,
      scrollY: 0,
      zoom: 2,
      anchorX: 0,
      anchorY: 0,
    };
    const transform = excalidrawSceneTransform(viewport);
    expect(transform).toBe('translate(0 0) scale(2)');
  });
});
