import { Server } from '@hocuspocus/server';
import { readTableGmUserId } from '@codex/sync/yjs/fog-guard';
import { isFogSecretsDocName, roomIdFromFogSecretsDocName } from '@codex/sync/yjs/fog-secrets';
import { isDatabaseConfigured } from '@codex/db';
import { afterFogGuard, beforeFogGuard } from './fog-guard.js';
import { afterLogGuard, beforeLogGuard } from './log-guard.js';
import { afterKickGuard, beforeKickGuard } from './kick-guard.js';
import { admitWebSocket, handleHttpRequest } from './http-routes.js';
import { createYjsDatabaseExtension } from './yjs-database.js';

const port = Number(process.env.PORT ?? 1999);
const host = process.env.HOST ?? '0.0.0.0';
const databaseExtension = createYjsDatabaseExtension();

if (!isDatabaseConfigured()) {
  console.warn(
    '[sync-server] DATABASE_URL not set — Yjs docs and invites are memory-only (no cross-device resume after restart).',
  );
} else {
  console.log('[sync-server] Postgres persistence enabled for Yjs documents and room invites.');
}

const server = new Server({
  name: 'codex-sync',
  port,
  address: host,
  quiet: process.env.NODE_ENV === 'production',
  debounce: 2000,
  maxDebounce: 10000,
  extensions: databaseExtension ? [databaseExtension] : [],

  async onRequest({ request, response }) {
    const handled = await handleHttpRequest(request, response);
    if (handled) {
      throw undefined;
    }

    if (request.url === '/health') {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end('ok');
      throw undefined;
    }

    response.writeHead(404);
    response.end('Not Found');
    throw undefined;
  },

  async onAuthenticate({ documentName, token, requestParameters, instance }) {
    if (isFogSecretsDocName(documentName)) {
      const roomId = roomIdFromFogSecretsDocName(documentName);
      const claimedOwnerId = token?.trim() || requestParameters.get('ownerId')?.trim();
      const publicDoc = roomId ? instance.documents.get(roomId) : undefined;
      const gmUserId = publicDoc ? readTableGmUserId(publicDoc) : undefined;
      if (!claimedOwnerId || !gmUserId || claimedOwnerId !== gmUserId) {
        throw new Error('gm_secrets_denied');
      }
      return;
    }

    const provided =
      token?.trim() || requestParameters.get('invite')?.trim() || null;
    const admission = await admitWebSocket(documentName, provided);
    if (!admission.allowed) {
      throw new Error(admission.reason);
    }
  },

  async beforeHandleMessage({ document, connection }) {
    beforeFogGuard(document, connection);
    beforeLogGuard(document, connection);
    beforeKickGuard(document, connection);
  },

  async afterHandleMessage({ document, connection }) {
    afterFogGuard(document, connection);
    afterLogGuard(document, connection);
    afterKickGuard(document, connection);
  },
});

void server.listen().then(() => {
  console.log(`@codex/sync-server listening on ${host}:${port}`);
});
