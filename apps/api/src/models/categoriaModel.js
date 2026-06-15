import { db } from '../db.js';

export const categoriaModel = {
  listarTodos() {
    return db.prepare('SELECT id, nome, descricao FROM categorias ORDER BY nome').all();
  },

  buscarPorId(id) {
    return db.prepare('SELECT id, nome, descricao FROM categorias WHERE id = ?').get(id) || null;
  },

  buscarPorNome(nome) {
    return db.prepare('SELECT id, nome, descricao FROM categorias WHERE lower(nome) = lower(?)').get(nome) || null;
  },

  inserir({ nome, descricao }) {
    const result = db.prepare(
      'INSERT INTO categorias (nome, descricao) VALUES (?, ?)'
    ).run(nome, descricao ?? null);

    return this.buscarPorId(Number(result.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;

    const novo = { ...atual, ...dados };

    db.prepare(
      'UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?'
    ).run(novo.nome, novo.descricao ?? null, id);

    return this.buscarPorId(id);
  },

  remover(id) {
    return db.prepare('DELETE FROM categorias WHERE id = ?').run(id).changes > 0;
  },

  possuiDespesas(id) {
    const row = db.prepare('SELECT 1 FROM despesas WHERE categoria_id = ? LIMIT 1').get(id);
    return row !== undefined;
  },

  contar() {
    return db.prepare('SELECT COUNT(*) AS total FROM categorias').get().total;
  },
};
