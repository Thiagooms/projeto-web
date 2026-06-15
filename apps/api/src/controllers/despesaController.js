import { despesaService } from '../services/despesaService.js';
import { readJson } from '../utils/http.js';

export const despesaController = {
  async listar({ query }) {
    return despesaService.listar(query);
  },

  async buscar({ params }) {
    return despesaService.buscar(params.id);
  },

  async criar({ req }) {
    const body = await readJson(req);
    return {
      status: 201,
      body: despesaService.criar(body),
    };
  },

  async atualizar({ req, params }) {
    const body = await readJson(req);
    return despesaService.atualizar(params.id, body);
  },

  async remover({ params }) {
    despesaService.remover(params.id);
    return { status: 204 };
  },
};
