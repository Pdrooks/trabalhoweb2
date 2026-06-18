const express = require('express');
const router = express.Router();
const { db } = require('../data');

function atualizarAtrasados() {
  const hoje = new Date().toISOString().split('T')[0];
  db.emprestimos.forEach(e => {
    if (e.status === 'ativo' && e.data_devolucao_prevista < hoje) {
      e.status = 'atrasado';
    }
  });
}

router.get('/', (req, res) => {
  atualizarAtrasados();
  const lista = db.emprestimos.map(e => {
    const leitor = db.usuarios.find(u => u.id === e.leitor_id);
    const livro = db.livros.find(l => l.id === e.livro_id);
    return { ...e, leitor_nome: leitor?.nome, livro_titulo: livro?.titulo };
  });
  res.json(lista.reverse());
});

router.get('/leitor/:id', (req, res) => {
  atualizarAtrasados();
  const lista = db.emprestimos
    .filter(e => e.leitor_id === Number(req.params.id))
    .map(e => {
      const livro = db.livros.find(l => l.id === e.livro_id);
      return { ...e, livro_titulo: livro?.titulo };
    });
  res.json(lista.reverse());
});

router.post('/', (req, res) => {
  const { perfil, leitor_id, livro_id, data_devolucao_prevista } = req.body;
  if (perfil !== 'leitor') {
    return res.status(403).json({ erro: 'Apenas leitores podem solicitar empréstimos.' });
  }
  if (!leitor_id || !livro_id || !data_devolucao_prevista) {
    return res.status(400).json({ erro: 'Dados incompletos para o empréstimo.' });
  }
  const livro = db.livros.find(l => l.id === Number(livro_id));
  if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
  if (livro.quantidade_disponivel <= 0) {
    return res.status(400).json({ erro: 'Livro sem estoque disponível.' });
  }
  const hoje = new Date().toISOString().split('T')[0];
  const novo = {
    id: db.ids.emprestimo++,
    livro_id: Number(livro_id),
    leitor_id: Number(leitor_id),
    data_emprestimo: hoje,
    data_devolucao_prevista,
    data_devolucao_real: null,
    status: 'ativo',
  };
  db.emprestimos.push(novo);
  livro.quantidade_disponivel--;
  res.status(201).json({ mensagem: 'Empréstimo registrado com sucesso.' });
});

router.put('/:id/devolver', (req, res) => {
  const { perfil } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem aprovar devoluções.' });
  }
  const emp = db.emprestimos.find(e => e.id === Number(req.params.id));
  if (!emp) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
  if (emp.status === 'devolvido') {
    return res.status(400).json({ erro: 'Empréstimo já devolvido.' });
  }
  emp.status = 'devolvido';
  emp.data_devolucao_real = new Date().toISOString().split('T')[0];
  const livro = db.livros.find(l => l.id === emp.livro_id);
  if (livro) livro.quantidade_disponivel++;
  res.json({ mensagem: 'Devolução registrada com sucesso.' });
});

router.delete('/:id', (req, res) => {
  const { perfil } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem cancelar empréstimos.' });
  }
  const idx = db.emprestimos.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
  const emp = db.emprestimos[idx];
  if (emp.status !== 'devolvido') {
    const livro = db.livros.find(l => l.id === emp.livro_id);
    if (livro) livro.quantidade_disponivel++;
  }
  db.emprestimos.splice(idx, 1);
  res.json({ mensagem: 'Empréstimo cancelado.' });
});

module.exports = router;
