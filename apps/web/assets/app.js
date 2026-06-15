const API_BASE = window.APP_CONFIG?.apiBase || 'http://localhost:3000/api';

const state = {
  categorias: [],
  despesas: [],
};

const elements = {
  alertArea: document.querySelector('#alert-area'),
  summaryTotal: document.querySelector('#summary-total'),
  summaryExpenses: document.querySelector('#summary-expenses'),
  summaryCategories: document.querySelector('#summary-categories'),
  categoryFilter: document.querySelector('#category-filter'),
  expenseCategory: document.querySelector('#expense-category'),
  editExpenseCategory: document.querySelector('#edit-expense-category'),
  expenseForm: document.querySelector('#expense-form'),
  expenseEditForm: document.querySelector('#expense-edit-form'),
  expensesTable: document.querySelector('#expenses-table'),
  categoryForm: document.querySelector('#category-form'),
  categoryEditForm: document.querySelector('#category-edit-form'),
  categoryList: document.querySelector('#category-list'),
};

const expenseModal = new bootstrap.Modal(document.querySelector('#expense-modal'));
const categoryModal = new bootstrap.Modal(document.querySelector('#category-modal'));

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

await init();

async function init() {
  setDefaultDate();
  bindEvents();
  await refreshAll();
}

function bindEvents() {
  elements.expenseForm.addEventListener('submit', handleCreateExpense);
  elements.expenseEditForm.addEventListener('submit', handleUpdateExpense);
  elements.categoryForm.addEventListener('submit', handleCreateCategory);
  elements.categoryEditForm.addEventListener('submit', handleUpdateCategory);
  elements.categoryFilter.addEventListener('change', loadExpenses);
}

function setDefaultDate() {
  const today = new Date().toISOString().slice(0, 10);
  elements.expenseForm.elements.data.value = today;
}

async function refreshAll() {
  await loadCategories();
  await Promise.all([loadExpenses(), loadSummary()]);
}

async function loadCategories() {
  state.categorias = await request('/categorias');
  renderCategoryOptions();
  renderCategories();
}

async function loadExpenses() {
  const categoriaId = elements.categoryFilter.value;
  const query = categoriaId ? `?categoriaId=${encodeURIComponent(categoriaId)}` : '';
  state.despesas = await request(`/despesas${query}`);
  renderExpenses();
}

async function loadSummary() {
  const summary = await request('/resumo');
  elements.summaryTotal.textContent = currency.format(summary.totalGeral || 0);
  elements.summaryExpenses.textContent = summary.quantidadeDespesas || 0;
  elements.summaryCategories.textContent = summary.quantidadeCategorias || 0;
}

function renderCategoryOptions() {
  const options = [
    '<option value="">Todas</option>',
    ...state.categorias.map((categoria) => option(categoria.id, categoria.nome)),
  ].join('');

  const formOptions = state.categorias.map((categoria) => option(categoria.id, categoria.nome)).join('');

  elements.categoryFilter.innerHTML = options;
  elements.expenseCategory.innerHTML = formOptions || '<option value="">Cadastre uma categoria</option>';
  elements.editExpenseCategory.innerHTML = formOptions;
}

function renderCategories() {
  if (!state.categorias.length) {
    elements.categoryList.innerHTML = '<div class="list-group-item text-secondary">Nenhuma categoria cadastrada.</div>';
    return;
  }

  elements.categoryList.innerHTML = state.categorias.map((categoria) => `
    <div class="list-group-item">
      <div class="d-flex justify-content-between gap-3">
        <div>
          <strong>${escapeHtml(categoria.nome)}</strong>
          <p class="text-secondary small mb-0">${escapeHtml(categoria.descricao || 'Sem descricao')}</p>
        </div>
        <div class="action-buttons">
          <button class="btn btn-sm btn-outline-secondary" data-category-edit="${categoria.id}" type="button">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-category-delete="${categoria.id}" type="button">Excluir</button>
        </div>
      </div>
    </div>
  `).join('');

  elements.categoryList.querySelectorAll('[data-category-edit]').forEach((button) => {
    button.addEventListener('click', () => openCategoryModal(Number(button.dataset.categoryEdit)));
  });

  elements.categoryList.querySelectorAll('[data-category-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteCategory(Number(button.dataset.categoryDelete)));
  });
}

function renderExpenses() {
  if (!state.despesas.length) {
    elements.expensesTable.innerHTML = `
      <tr class="empty-row">
        <td class="text-center text-secondary" colspan="5">Nenhuma despesa encontrada.</td>
      </tr>
    `;
    return;
  }

  elements.expensesTable.innerHTML = state.despesas.map((despesa) => `
    <tr>
      <td>
        <strong>${escapeHtml(despesa.titulo)}</strong>
        ${despesa.observacao ? `<div class="expense-note text-secondary small">${escapeHtml(despesa.observacao)}</div>` : ''}
      </td>
      <td>${escapeHtml(despesa.categoriaNome)}</td>
      <td>${formatDate(despesa.data)}</td>
      <td class="text-end">${currency.format(despesa.valor)}</td>
      <td class="text-end action-buttons">
        <button class="btn btn-sm btn-outline-secondary" data-expense-edit="${despesa.id}" type="button">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-expense-delete="${despesa.id}" type="button">Excluir</button>
      </td>
    </tr>
  `).join('');

  elements.expensesTable.querySelectorAll('[data-expense-edit]').forEach((button) => {
    button.addEventListener('click', () => openExpenseModal(Number(button.dataset.expenseEdit)));
  });

  elements.expensesTable.querySelectorAll('[data-expense-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteExpense(Number(button.dataset.expenseDelete)));
  });
}

async function handleCreateExpense(event) {
  event.preventDefault();

  try {
    await request('/despesas', {
      method: 'POST',
      body: getExpensePayload(elements.expenseForm),
    });

    elements.expenseForm.reset();
    setDefaultDate();
    showAlert('Despesa cadastrada.', 'success');
    await Promise.all([loadExpenses(), loadSummary()]);
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

async function handleUpdateExpense(event) {
  event.preventDefault();

  try {
    const id = elements.expenseEditForm.elements.id.value;
    await request(`/despesas/${id}`, {
      method: 'PUT',
      body: getExpensePayload(elements.expenseEditForm),
    });

    expenseModal.hide();
    showAlert('Despesa atualizada.', 'success');
    await Promise.all([loadExpenses(), loadSummary()]);
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

async function handleCreateCategory(event) {
  event.preventDefault();

  try {
    await request('/categorias', {
      method: 'POST',
      body: getCategoryPayload(elements.categoryForm),
    });

    elements.categoryForm.reset();
    showAlert('Categoria cadastrada.', 'success');
    await refreshAll();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

async function handleUpdateCategory(event) {
  event.preventDefault();

  try {
    const id = elements.categoryEditForm.elements.id.value;
    await request(`/categorias/${id}`, {
      method: 'PUT',
      body: getCategoryPayload(elements.categoryEditForm),
    });

    categoryModal.hide();
    showAlert('Categoria atualizada.', 'success');
    await refreshAll();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

function getExpensePayload(form) {
  return {
    titulo: form.elements.titulo.value,
    valor: form.elements.valor.value,
    data: form.elements.data.value,
    observacao: form.elements.observacao.value,
    categoriaId: form.elements.categoriaId.value,
  };
}

function getCategoryPayload(form) {
  return {
    nome: form.elements.nome.value,
    descricao: form.elements.descricao.value,
  };
}

function openExpenseModal(id) {
  const despesa = state.despesas.find((item) => item.id === id);
  if (!despesa) return;

  const form = elements.expenseEditForm;
  form.elements.id.value = despesa.id;
  form.elements.titulo.value = despesa.titulo;
  form.elements.valor.value = despesa.valor;
  form.elements.data.value = despesa.data;
  form.elements.categoriaId.value = despesa.categoriaId;
  form.elements.observacao.value = despesa.observacao || '';
  expenseModal.show();
}

function openCategoryModal(id) {
  const categoria = state.categorias.find((item) => item.id === id);
  if (!categoria) return;

  const form = elements.categoryEditForm;
  form.elements.id.value = categoria.id;
  form.elements.nome.value = categoria.nome;
  form.elements.descricao.value = categoria.descricao || '';
  categoryModal.show();
}

async function deleteExpense(id) {
  if (!confirm('Excluir esta despesa?')) return;

  try {
    await request(`/despesas/${id}`, { method: 'DELETE' });
    showAlert('Despesa excluida.', 'success');
    await Promise.all([loadExpenses(), loadSummary()]);
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

async function deleteCategory(id) {
  if (!confirm('Excluir esta categoria?')) return;

  try {
    await request(`/categorias/${id}`, { method: 'DELETE' });
    showAlert('Categoria excluida.', 'success');
    await refreshAll();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao acessar a API');
  }

  return data;
}

function showAlert(message, variant) {
  elements.alertArea.innerHTML = `
    <div class="alert alert-${variant} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>
  `;
}

function option(value, label) {
  return `<option value="${value}">${escapeHtml(label)}</option>`;
}

function formatDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
