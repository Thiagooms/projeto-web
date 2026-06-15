import { resumoController } from '../controllers/resumoController.js';
import { route } from '../utils/router.js';

export const resumoRoutes = [
  route('GET', '/api/resumo', resumoController.obter),
];
