import { categoriaModel } from '../models/categoriaModel.js';
import { conflict, notFound, unprocessable } from '../utils/errors.js';
import { optionalString, parsePositiveId, requiredString } from '../utils/validation.js';

export const categoriaService = {
  listar() {
    return categoriaModel.listarTodos();
  },

  buscar(id) {
    const categoriaId = parsePositiveId(id);
    const categoria = categoriaModel.buscarPorId(categoriaId);

    if (!categoria) {
      throw notFound('Categoria nao encontrada');
    }

    return categoria;
  },

  criar(dados) {
    const categoria = normalizarCategoria(dados);
    garantirNomeDisponivel(categoria.nome);
    return categoriaModel.inserir(categoria);
  },

  atualizar(id, dados) {
    const categoriaId = parsePositiveId(id);
    const atual = categoriaModel.buscarPorId(categoriaId);

    if (!atual) {
      throw notFound('Categoria nao encontrada');
    }

    const categoria = normalizarCategoria({ ...atual, ...dados });
    garantirNomeDisponivel(categoria.nome, categoriaId);

    return categoriaModel.atualizar(categoriaId, categoria);
  },

  remover(id) {
    const categoriaId = parsePositiveId(id);
    const atual = categoriaModel.buscarPorId(categoriaId);

    if (!atual) {
      throw notFound('Categoria nao encontrada');
    }

    if (categoriaModel.possuiDespesas(categoriaId)) {
      throw unprocessable('Nao e possivel excluir categoria com despesas vinculadas');
    }

    categoriaModel.remover(categoriaId);
  },

  contar() {
    return categoriaModel.contar();
  },
};

function normalizarCategoria(dados) {
  return {
    nome: requiredString(dados.nome, 'nome'),
    descricao: optionalString(dados.descricao),
  };
}

function garantirNomeDisponivel(nome, idAtual) {
  const existente = categoriaModel.buscarPorNome(nome);

  if (existente && existente.id !== idAtual) {
    throw conflict('Ja existe uma categoria com esse nome');
  }
}
