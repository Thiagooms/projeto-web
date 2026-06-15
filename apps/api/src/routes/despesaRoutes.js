import { despesaController } from '../controllers/despesaController.js';
import { route } from '../utils/router.js';

export const despesaRoutes = [
  route('GET', '/api/despesas', despesaController.listar),
  route('GET', '/api/despesas/:id', despesaController.buscar),
  route('POST', '/api/despesas', despesaController.criar),
  route('PUT', '/api/despesas/:id', despesaController.atualizar),
  route('DELETE', '/api/despesas/:id', despesaController.remover),
];
