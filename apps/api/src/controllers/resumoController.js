import { resumoService } from '../services/resumoService.js';

export const resumoController = {
  async obter() {
    return resumoService.obter();
  },
};
