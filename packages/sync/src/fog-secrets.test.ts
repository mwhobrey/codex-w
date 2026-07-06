import { describe, expect, it } from 'vitest';
import {
  fogSecretsDocName,
  isFogSecretsDocName,
  reconcileFogSecrets,
  roomIdFromFogSecretsDocName,
} from './yjs/fog-secrets';
import { createPlayRoomDoc, getPlayRoomExcalidrawElements, getPlayRoomExcalidrawFiles } from './yjs/play-room-doc';
import type { PositionedElement } from './yjs/fog-secrets';

function rect(id: string, x: number, y: number): PositionedElement {
  return { id, x, y, width: 10, height: 10, type: 'rectangle' };
}

function image(id: string, x: number, y: number, fileId: string): PositionedElement {
  return { id, x, y, width: 10, height: 10, type: 'image', fileId };
}

describe('fog secrets doc naming', () => {
  it('builds and parses the secrets doc name', () => {
    const name = fogSecretsDocName('room-1');
    expect(isFogSecretsDocName(name)).toBe(true);
    expect(isFogSecretsDocName('room-1')).toBe(false);
    expect(roomIdFromFogSecretsDocName(name)).toBe('room-1');
    expect(roomIdFromFogSecretsDocName('room-1')).toBeNull();
  });
});

describe('reconcileFogSecrets', () => {
  it('moves an element under fog from public to secrets', () => {
    const publicDoc = createPlayRoomDoc();
    const secretsDoc = createPlayRoomDoc();
    getPlayRoomExcalidrawElements(publicDoc).push([rect('a', 20, 20)]);

    const changed = reconcileFogSecrets(publicDoc, secretsDoc, new Set(['0,0']));

    expect(changed).toBe(true);
    expect(getPlayRoomExcalidrawElements(publicDoc).toArray()).toEqual([]);
    expect((getPlayRoomExcalidrawElements(secretsDoc).toArray()[0] as PositionedElement).id).toBe('a');
  });

  it('moves an element back to public once its cell is revealed', () => {
    const publicDoc = createPlayRoomDoc();
    const secretsDoc = createPlayRoomDoc();
    getPlayRoomExcalidrawElements(secretsDoc).push([rect('a', 20, 20)]);

    const changed = reconcileFogSecrets(publicDoc, secretsDoc, new Set());

    expect(changed).toBe(true);
    expect(getPlayRoomExcalidrawElements(secretsDoc).toArray()).toEqual([]);
    expect((getPlayRoomExcalidrawElements(publicDoc).toArray()[0] as PositionedElement).id).toBe('a');
  });

  it('is a no-op when nothing needs to move', () => {
    const publicDoc = createPlayRoomDoc();
    const secretsDoc = createPlayRoomDoc();
    getPlayRoomExcalidrawElements(publicDoc).push([rect('a', 20, 20)]);

    const changed = reconcileFogSecrets(publicDoc, secretsDoc, new Set());

    expect(changed).toBe(false);
    expect(getPlayRoomExcalidrawElements(publicDoc).toArray()).toHaveLength(1);
  });

  it('moves a referenced file alongside its image element', () => {
    const publicDoc = createPlayRoomDoc();
    const secretsDoc = createPlayRoomDoc();
    getPlayRoomExcalidrawElements(publicDoc).push([image('a', 20, 20, 'file-1')]);
    getPlayRoomExcalidrawFiles(publicDoc).set('file-1', {
      id: 'file-1',
      mimeType: 'image/png',
      dataURL: 'data:image/png;base64,xxx',
      created: 0,
    });

    reconcileFogSecrets(publicDoc, secretsDoc, new Set(['0,0']));

    expect(getPlayRoomExcalidrawFiles(publicDoc).has('file-1')).toBe(false);
    expect(getPlayRoomExcalidrawFiles(secretsDoc).has('file-1')).toBe(true);
  });

  it('handles simultaneous hide and reveal in one pass', () => {
    const publicDoc = createPlayRoomDoc();
    const secretsDoc = createPlayRoomDoc();
    getPlayRoomExcalidrawElements(publicDoc).push([rect('hidden-now', 20, 20)]);
    getPlayRoomExcalidrawElements(secretsDoc).push([rect('revealed-now', 200, 200)]);

    reconcileFogSecrets(publicDoc, secretsDoc, new Set(['0,0']));

    const publicIds = getPlayRoomExcalidrawElements(publicDoc).toArray().map((e) => (e as PositionedElement).id);
    const secretIds = getPlayRoomExcalidrawElements(secretsDoc).toArray().map((e) => (e as PositionedElement).id);
    expect(publicIds).toEqual(['revealed-now']);
    expect(secretIds).toEqual(['hidden-now']);
  });
});
