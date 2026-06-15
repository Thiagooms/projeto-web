import assert from 'node:assert/strict';
import { createServer } from 'node:http';

process.env.DB_PATH = ':memory:';

const { handleRequest } = await import('../apps/api/src/app.js');

const server = createServer(handleRequest);

await new Promise((resolve) => {
  server.listen(0, '127.0.0.1', resolve);
});

const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}/api`;

try {
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.status, 'ok');

  const categoria = await request('/categorias', {
    method: 'POST',
    body: { nome: 'Alimentacao', descricao: 'Gastos com comida' },
  });
  assert.equal(categoria.status, 201);
  assert.equal(categoria.body.nome, 'Alimentacao');

  const duplicada = await request('/categorias', {
    method: 'POST',
    body: { nome: 'Alimentacao' },
  });
  assert.equal(duplicada.status, 409);

  const despesa = await request('/despesas', {
    method: 'POST',
    body: {
      titulo: 'Almoco',
      valor: 35.5,
      data: '2026-06-15',
      categoriaId: categoria.body.id,
    },
  });
  assert.equal(despesa.status, 201);
  assert.equal(despesa.body.categoriaNome, 'Alimentacao');

  const despesas = await request('/despesas');
  assert.equal(despesas.status, 200);
  assert.equal(despesas.body.length, 1);

  const resumo = await request('/resumo');
  assert.equal(resumo.status, 200);
  assert.equal(resumo.body.quantidadeDespesas, 1);
  assert.equal(resumo.body.quantidadeCategorias, 1);
  assert.equal(resumo.body.totalGeral, 35.5);

  const removerCategoriaVinculada = await request(`/categorias/${categoria.body.id}`, {
    method: 'DELETE',
  });
  assert.equal(removerCategoriaVinculada.status, 422);

  console.log('Smoke test ok');
} finally {
  server.close();
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return {
    status: response.status,
    body: response.status === 204 ? null : await response.json(),
  };
}
