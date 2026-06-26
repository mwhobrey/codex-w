/**
 * Excalidraw pins zoom / undo / help to a bottom footer (~92px tall).
 * Codex floating map controls sit above that band so nothing overlaps.
 */
export const MAP_FLOATING_BOTTOM = '5.75rem';

/** Static Tailwind class — do not build dynamically or JIT will drop it. */
export const MAP_FLOATING_BOTTOM_CLASS = 'bottom-[5.75rem]';

export const MAP_FLOATING_BOTTOM_STYLE = {
  '--map-floating-bottom': MAP_FLOATING_BOTTOM,
} as const;

/** Play mode hides Excalidraw footer — floating controls can sit closer to the edge. */
export const MAP_FLOATING_BOTTOM_PLAY = '1rem';

export const MAP_FLOATING_BOTTOM_PLAY_CLASS = 'bottom-4';

export const MAP_FLOATING_BOTTOM_PLAY_STYLE = {
  '--map-floating-bottom': MAP_FLOATING_BOTTOM_PLAY,
} as const;
