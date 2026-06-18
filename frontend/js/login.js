const API = 'http://localhost:3000';

function trocar(mostrar, esconder) {
  document.getElementById(mostrar).classList.remove('oculto');
  document.getElementById(esconder).classList.add('oculto');
}

function mostrarMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = 'msg ' + tipo;
  setTimeout(() => { el.className = 'msg'; el.textContent = ''; }, 4000);
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const dados = await res.json();
    if (!res.ok) {
      mostrarMsg('msg-login', dados.erro, 'erro');
      return;
    }
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
    if (dados.usuario.perfil === 'bibliotecario') {
      window.location.href = 'bibliotecario.html';
    } else {
      window.location.href = 'leitor.html';
    }
  } catch {
    mostrarMsg('msg-login', 'Não foi possível conectar ao servidor.', 'erro');
  }
});

document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome   = document.getElementById('cad-nome').value;
  const email  = document.getElementById('cad-email').value;
  const senha  = document.getElementById('cad-senha').value;
  const perfil = document.getElementById('cad-perfil').value;

  try {
    const res = await fetch(API + '/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, perfil }),
    });
    const dados = await res.json();
    if (!res.ok) {
      mostrarMsg('msg-cadastro', dados.erro, 'erro');
      return;
    }
    mostrarMsg('msg-cadastro', 'Cadastro realizado! Faça login.', 'sucesso');
    document.getElementById('form-cadastro').reset();
    setTimeout(() => trocar('sec-login', 'sec-cadastro'), 1500);
  } catch {
    mostrarMsg('msg-cadastro', 'Não foi possível conectar ao servidor.', 'erro');
  }
});
