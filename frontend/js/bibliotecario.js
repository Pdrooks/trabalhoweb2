const API = 'http://localhost:3000';
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!usuario || usuario.perfil !== 'bibliotecario') {
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

async function carregarLivros() {
  const res = await fetch(API + '/livros');
  const lista = await res.json();
  const tbody = document.querySelector('#tabela-livros tbody');
  tbody.innerHTML = '';
  lista.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${l.id}</td>
      <td>${l.titulo}</td>
      <td>${l.autor}</td>
      <td>${l.ano_publicacao || '-'}</td>
      <td>${l.quantidade_disponivel}</td>
      <td>
        <button type="button" class="btn btn-warning" onclick="editarLivro(${l.id},'${l.titulo.replace(/'/g,"\\'")}','${l.autor.replace(/'/g,"\\'")}',${l.ano_publicacao || ''},${l.quantidade_disponivel})">Editar</button>
        <button type="button" class="btn btn-danger" onclick="excluirLivro(${l.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function carregarEmprestimos() {
  const res = await fetch(API + '/emprestimos');
  const lista = await res.json();
  const tbody = document.querySelector('#tabela-emprestimos tbody');
  tbody.innerHTML = '';
  lista.forEach(e => {
    const tr = document.createElement('tr');
    const acoes = e.status !== 'devolvido'
      ? `<button type="button" class="btn btn-success" onclick="aprovarDevolucao(${e.id})">Aprovar devolução</button>`
      : '-';
    tr.innerHTML = `
      <td>${e.id}</td>
      <td>${e.leitor_nome}</td>
      <td>${e.livro_titulo}</td>
      <td>${e.data_emprestimo}</td>
      <td>${e.data_devolucao_prevista}</td>
      <td>${badge(e.status)}</td>
      <td>${acoes}</td>`;
    tbody.appendChild(tr);
  });
}

function editarLivro(id, titulo, autor, ano, qtd) {
  document.getElementById('livro-id').value = id;
  document.getElementById('titulo').value = titulo;
  document.getElementById('autor').value = autor;
  document.getElementById('ano').value = ano;
  document.getElementById('qtd').value = qtd;
  document.getElementById('titulo').focus();
}

async function salvarLivro() {
  const id    = document.getElementById('livro-id').value;
  const titulo = document.getElementById('titulo').value.trim();
  const autor  = document.getElementById('autor').value.trim();
  const ano    = document.getElementById('ano').value;
  const qtd    = document.getElementById('qtd').value;

  if (!titulo || !autor || qtd === '') {
    mostrarMsg('msg-livro', 'Preencha título, autor e quantidade.', 'erro');
    return;
  }

  const body = { perfil: usuario.perfil, titulo, autor, ano_publicacao: ano || null, quantidade_disponivel: Number(qtd) };
  const url    = id ? `${API}/livros/${id}` : `${API}/livros`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const dados = await res.json();

  if (!res.ok) {
    mostrarMsg('msg-livro', dados.erro, 'erro');
    return;
  }

  mostrarMsg('msg-livro', dados.mensagem, 'sucesso');
  document.getElementById('livro-id').value = '';
  document.getElementById('titulo').value = '';
  document.getElementById('autor').value = '';
  document.getElementById('ano').value = '';
  document.getElementById('qtd').value = '';
  carregarLivros();
}

async function excluirLivro(id) {
  if (!confirm('Tem certeza que quer excluir este livro?')) return;
  const res = await fetch(`${API}/livros/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ perfil: usuario.perfil }),
  });
  const dados = await res.json();
  if (!res.ok) {
    alert(dados.erro);
    return;
  }
  carregarLivros();
}

async function aprovarDevolucao(id) {
  const res = await fetch(`${API}/emprestimos/${id}/devolver`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ perfil: usuario.perfil }),
  });
  const dados = await res.json();
  if (!res.ok) {
    alert(dados.erro);
    return;
  }
  carregarEmprestimos();
  carregarLivros();
}

carregarLivros();
carregarEmprestimos();
