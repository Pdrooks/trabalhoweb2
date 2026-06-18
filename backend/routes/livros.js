const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM livros');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar livros.' });
  }
});

router.post('/', async (req, res) => {
  const { perfil, titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem cadastrar livros.' });
  }
  if (!titulo || !autor || quantidade_disponivel === undefined) {
    return res.status(400).json({ erro: 'Título, autor e quantidade são obrigatórios.' });
  }
  try {
    await db.query(
      'INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)',
      [titulo, autor, ano_publicacao || null, quantidade_disponivel]
    );
    res.status(201).json({ mensagem: 'Livro cadastrado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar livro.' });
  }
});

router.put('/:id', async (req, res) => {
  const { perfil, titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem editar livros.' });
  }
  if (!titulo || !autor || quantidade_disponivel === undefined) {
    return res.status(400).json({ erro: 'Título, autor e quantidade são obrigatórios.' });
  }
  try {
    await db.query(
      'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?',
      [titulo, autor, ano_publicacao || null, quantidade_disponivel, req.params.id]
    );
    res.json({ mensagem: 'Livro atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar livro.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { perfil } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem remover livros.' });
  }
  try {
    await db.query('DELETE FROM livros WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Livro removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover livro.' });
  }
});

module.exports = router;
