import { categoriaRoutes } from './routes/categoriaRoutes.js';
import { despesaRoutes } from './routes/despesaRoutes.js';
import { resumoRoutes } from './routes/resumoRoutes.js';
import { matchRoute, route } from './utils/router.js';
import { AppError } from './utils/errors.js';
import { sendJson, sendNoContent } from './utils/http.js';

const routes = [
  ...categoriaRoutes,
  ...despesaRoutes,
  ...resumoRoutes,
  route('GET', '/api/health', async () => ({ status: 'ok' })),
];

export async function handleRequest(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const match = matchRoute(routes, req.method, url.pathname);

    if (!match) {
      throw new AppError(404, 'Rota nao encontrada');
    }

    const result = await match.route.handler({
      req,
      res,
      params: match.params,
      query: Object.fromEntries(url.searchParams.entries()),
    });

    if (res.writableEnded) return;

    const statusCode = typeof result?.status === 'number' ? result.status : 200;

    if (statusCode === 204) {
      sendNoContent(res);
      return;
    }

    sendJson(res, statusCode, Object.hasOwn(result ?? {}, 'body') ? result.body : result);
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
    const details = error instanceof AppError ? error.details : undefined;

    sendJson(res, status, {
      error: message,
      ...(details ? { details } : {}),
    });
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
