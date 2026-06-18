const express = require('express');
const router = express.Router();
const { db } = require('../data');

router.get('/', (req, res) => {
  res.json(db.livros);
});

router.post('/', (req, res) => {
  const { perfil, titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem cadastrar livros.' });
  }
  if (!titulo || !autor || quantidade_disponivel === undefined) {
    return res.status(400).json({ erro: 'Título, autor e quantidade são obrigatórios.' });
  }
  const novo = { id: db.ids.livro++, titulo, autor, ano_publicacao: ano_publicacao || null, quantidade_disponivel: Number(quantidade_disponivel) };
  db.livros.push(novo);
  res.status(201).json({ mensagem: 'Livro cadastrado com sucesso.' });
});

router.put('/:id', (req, res) => {
  const { perfil, titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem editar livros.' });
  }
  if (!titulo || !autor || quantidade_disponivel === undefined) {
    return res.status(400).json({ erro: 'Título, autor e quantidade são obrigatórios.' });
  }
  const livro = db.livros.find(l => l.id === Number(req.params.id));
  if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
  livro.titulo = titulo;
  livro.autor = autor;
  livro.ano_publicacao = ano_publicacao || null;
  livro.quantidade_disponivel = Number(quantidade_disponivel);
  res.json({ mensagem: 'Livro atualizado com sucesso.' });
});

router.delete('/:id', (req, res) => {
  const { perfil } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem remover livros.' });
  }
  const idx = db.livros.findIndex(l => l.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Livro não encontrado.' });
  db.livros.splice(idx, 1);
  res.json({ mensagem: 'Livro removido com sucesso.' });
});

module.exports = router;
