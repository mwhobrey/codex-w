import { Server } from '@hocuspocus/server';
import { afterFogGuard, beforeFogGuard } from './fog-guard.js';
import { admitWebSocket, handleHttpRequest } from './http-routes.js';

const port = Number(process.env.PORT ?? 1999);
const host = process.env.HOST ?? '0.0.0.0';

const server = new Server({
  name: 'codex-sync',
  port,
  address: host,
  quiet: process.env.NODE_ENV === 'production',

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

  async onAuthenticate({ documentName, token, requestParameters }) {
    const provided =
      token?.trim() || requestParameters.get('invite')?.trim() || null;
    const admission = admitWebSocket(documentName, provided);
    if (!admission.allowed) {
      throw new Error(admission.reason);
    }
  },

  async beforeHandleMessage({ document, connection }) {
    beforeFogGuard(document, connection);
  },

  async afterHandleMessage({ document, connection }) {
    afterFogGuard(document, connection);
  },
});

void server.listen().then(() => {
  console.log(`@codex/sync-server listening on ${host}:${port}`);
});
