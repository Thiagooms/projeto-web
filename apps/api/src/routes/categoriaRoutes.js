import { categoriaController } from '../controllers/categoriaController.js';
import { route } from '../utils/router.js';

export const categoriaRoutes = [
  route('GET', '/api/categorias', categoriaController.listar),
  route('GET', '/api/categorias/:id', categoriaController.buscar),
  route('POST', '/api/categorias', categoriaController.criar),
  route('PUT', '/api/categorias/:id', categoriaController.atualizar),
  route('DELETE', '/api/categorias/:id', categoriaController.remover),
];
