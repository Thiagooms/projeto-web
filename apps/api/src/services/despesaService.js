import { categoriaModel } from '../models/categoriaModel.js';
import { despesaModel } from '../models/despesaModel.js';
import { notFound, unprocessable } from '../utils/errors.js';
import {
  optionalString,
  parsePositiveId,
  positiveNumber,
  requiredDate,
  requiredString,
} from '../utils/validation.js';

export const despesaService = {
  listar(filtros = {}) {
    return despesaModel.listarTodas(normalizarFiltros(filtros));
  },

  buscar(id) {
    const despesaId = parsePositiveId(id);
    const despesa = despesaModel.buscarPorId(despesaId);

    if (!despesa) {
      throw notFound('Despesa nao encontrada');
    }

    return despesa;
  },

  criar(dados) {
    const despesa = normalizarDespesa(dados);
    garantirCategoriaExistente(despesa.categoriaId);
    return despesaModel.inserir(despesa);
  },

  atualizar(id, dados) {
    const despesaId = parsePositiveId(id);
    const atual = despesaModel.buscarPorId(despesaId);

    if (!atual) {
      throw notFound('Despesa nao encontrada');
    }

    const despesa = normalizarDespesa({ ...atual, ...dados });
    garantirCategoriaExistente(despesa.categoriaId);

    return despesaModel.atualizar(despesaId, despesa);
  },

  remover(id) {
    const despesaId = parsePositiveId(id);
    const removida = despesaModel.remover(despesaId);

    if (!removida) {
      throw notFound('Despesa nao encontrada');
    }
  },
};

function normalizarDespesa(dados) {
  return {
    titulo: requiredString(dados.titulo, 'titulo'),
    valor: positiveNumber(dados.valor, 'valor'),
    data: requiredDate(dados.data, 'data'),
    observacao: optionalString(dados.observacao),
    categoriaId: parsePositiveId(dados.categoriaId, 'categoriaId'),
  };
}

function normalizarFiltros(filtros) {
  return {
    ...(filtros.categoriaId ? { categoriaId: parsePositiveId(filtros.categoriaId, 'categoriaId') } : {}),
    ...(filtros.dataInicial ? { dataInicial: requiredDate(filtros.dataInicial, 'dataInicial') } : {}),
    ...(filtros.dataFinal ? { dataFinal: requiredDate(filtros.dataFinal, 'dataFinal') } : {}),
  };
}

function garantirCategoriaExistente(categoriaId) {
  if (!categoriaModel.buscarPorId(categoriaId)) {
    throw unprocessable('Categoria informada nao existe');
  }
}
