import { db } from '../db.js';

const despesaSelect = `
  SELECT
    d.id,
    d.titulo,
    d.valor,
    d.data,
    d.observacao,
    d.categoria_id AS categoriaId,
    c.nome AS categoriaNome
  FROM despesas d
  JOIN categorias c ON c.id = d.categoria_id
`;

export const despesaModel = {
  listarTodas(filtros = {}) {
    const { where, params } = montarFiltros(filtros);
    return db.prepare(`${despesaSelect} ${where} ORDER BY d.data DESC, d.id DESC`).all(...params);
  },

  buscarPorId(id) {
    return db.prepare(`${despesaSelect} WHERE d.id = ?`).get(id) || null;
  },

  inserir({ titulo, valor, data, observacao, categoriaId }) {
    const result = db.prepare(
      `INSERT INTO despesas (titulo, valor, data, observacao, categoria_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(titulo, valor, data, observacao ?? null, categoriaId);

    return this.buscarPorId(Number(result.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;

    const novo = { ...atual, ...dados };

    db.prepare(
      `UPDATE despesas
       SET titulo = ?, valor = ?, data = ?, observacao = ?, categoria_id = ?
       WHERE id = ?`
    ).run(novo.titulo, novo.valor, novo.data, novo.observacao ?? null, novo.categoriaId, id);

    return this.buscarPorId(id);
  },

  remover(id) {
    return db.prepare('DELETE FROM despesas WHERE id = ?').run(id).changes > 0;
  },

  obterResumo() {
    const geral = db.prepare(
      `SELECT
        COUNT(*) AS quantidadeDespesas,
        COALESCE(SUM(valor), 0) AS totalGeral
       FROM despesas`
    ).get();

    const totalPorCategoria = db.prepare(
      `SELECT
        c.id AS categoriaId,
        c.nome AS categoriaNome,
        COUNT(d.id) AS quantidade,
        COALESCE(SUM(d.valor), 0) AS total
       FROM categorias c
       LEFT JOIN despesas d ON d.categoria_id = c.id
       GROUP BY c.id, c.nome
       ORDER BY c.nome`
    ).all();

    return {
      totalGeral: geral.totalGeral,
      quantidadeDespesas: geral.quantidadeDespesas,
      totalPorCategoria,
    };
  },
};

function montarFiltros({ categoriaId, dataInicial, dataFinal }) {
  const conditions = [];
  const params = [];

  if (categoriaId !== undefined) {
    conditions.push('d.categoria_id = ?');
    params.push(categoriaId);
  }

  if (dataInicial) {
    conditions.push('d.data >= ?');
    params.push(dataInicial);
  }

  if (dataFinal) {
    conditions.push('d.data <= ?');
    params.push(dataFinal);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}
