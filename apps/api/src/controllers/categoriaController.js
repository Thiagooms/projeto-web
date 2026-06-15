import { categoriaService } from '../services/categoriaService.js';
import { readJson } from '../utils/http.js';

export const categoriaController = {
  async listar() {
    return categoriaService.listar();
  },

  async buscar({ params }) {
    return categoriaService.buscar(params.id);
  },

  async criar({ req }) {
    const body = await readJson(req);
    return {
      status: 201,
      body: categoriaService.criar(body),
    };
  },

  async atualizar({ req, params }) {
    const body = await readJson(req);
    return categoriaService.atualizar(params.id, body);
  },

  async remover({ params }) {
    categoriaService.remover(params.id);
    return { status: 204 };
  },
};
