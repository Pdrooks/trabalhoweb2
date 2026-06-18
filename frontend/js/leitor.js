const API = 'http://localhost:3000';
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!usuario || usuario.perfil !== 'leitor') {
  window.location.href = 'index.html';
}

document.getElementById('nome-usuario').textContent = 'Olá, ' + usuario.nome;

function sair() {
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

function mostrarMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = 'msg ' + tipo;
  setTimeout(() => { el.className = 'msg'; el.textContent = ''; }, 4000);
}

function badge(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

function dataMinima() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

async function carregarLivros() {
  const res = await fetch(API + '/livros');
  const lista = await res.json();
  const tbody = document.querySelector('#tabela-livros tbody');
  tbody.innerHTML = '';
  lista.forEach(l => {
    const tr = document.createElement('tr');
    const disponivel = l.quantidade_disponivel > 0;
    tr.innerHTML = `
      <td>${l.id}</td>
      <td>${l.titulo}</td>
      <td>${l.autor}</td>
      <td>${l.ano_publicacao || '-'}</td>
      <td>${l.quantidade_disponivel}</td>
      <td><input type="date" id="data-${l.id}" min="${dataMinima()}"></td>
      <td>
        <button type="button" class="btn btn-primary" onclick="solicitarEmprestimo(${l.id})" ${disponivel ? '' : 'disabled'}>
          ${disponivel ? 'Solicitar' : 'Indisponível'}
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function carregarMeusEmprestimos() {
  const res = await fetch(`${API}/emprestimos/leitor/${usuario.id}`);
  const lista = await res.json();
  const tbody = document.querySelector('#tabela-meus tbody');
  tbody.innerHTML = '';
  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">Nenhum empréstimo encontrado.</td></tr>';
    return;
  }
  lista.forEach(e => {
    const tr = document.createElement('tr');
    const podeSolicitar = e.status !== 'devolvido';
    tr.innerHTML = `
      <td>${e.livro_titulo}</td>
      <td>${e.data_emprestimo}</td>
      <td>${e.data_devolucao_prevista}</td>
      <td>${badge(e.status)}</td>
      <td>
        ${podeSolicitar
          ? `<button type="button" class="btn btn-warning" onclick="solicitarDevolucao(${e.id})">Solicitar devolução</button>`
          : '-'}
      </td>`;
    tbody.appendChild(tr);
  });
}

async function solicitarEmprestimo(livro_id) {
  const dataInput = document.getElementById('data-' + livro_id);
  if (!dataInput.value) {
    mostrarMsg('msg-emprestimo', 'Informe a data de devolução prevista.', 'erro');
    return;
  }

  const res = await fetch(API + '/emprestimos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      perfil: usuario.perfil,
      leitor_id: usuario.id,
      livro_id,
      data_devolucao_prevista: dataInput.value,
    }),
  });
  const dados = await res.json();
  if (!res.ok) {
    mostrarMsg('msg-emprestimo', dados.erro, 'erro');
    return;
  }
  mostrarMsg('msg-emprestimo', dados.mensagem, 'sucesso');
  carregarLivros();
  carregarMeusEmprestimos();
}

async function solicitarDevolucao(id) {
  if (!confirm('Confirmar solicitação de devolução?')) return;
  mostrarMsg('msg-devolucao', 'Solicitação enviada! Aguarde a aprovação do bibliotecário.', 'sucesso');
}

carregarLivros();
carregarMeusEmprestimos();
