import { categoriaService } from './categoriaService.js';
import { despesaModel } from '../models/despesaModel.js';

export const resumoService = {
  obter() {
    const resumo = despesaModel.obterResumo();

    return {
      ...resumo,
      quantidadeCategorias: categoriaService.contar(),
    };
  },
};
