const express = require('express');
const router = express.Router();
const db = require('../db');

async function atualizarAtrasados() {
  const hoje = new Date().toISOString().split('T')[0];
  await db.query(
    `UPDATE emprestimos SET status = 'atrasado'
     WHERE status = 'ativo' AND data_devolucao_prevista < ?`,
    [hoje]
  );
}

router.get('/', async (req, res) => {
  try {
    await atualizarAtrasados();
    const [rows] = await db.query(`
      SELECT e.*, u.nome AS leitor_nome, l.titulo AS livro_titulo
      FROM emprestimos e
      JOIN usuarios u ON e.leitor_id = u.id
      JOIN livros l ON e.livro_id = l.id
      ORDER BY e.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar empréstimos.' });
  }
});

router.get('/leitor/:id', async (req, res) => {
  try {
    await atualizarAtrasados();
    const [rows] = await db.query(`
      SELECT e.*, l.titulo AS livro_titulo
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      WHERE e.leitor_id = ?
      ORDER BY e.id DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar empréstimos do leitor.' });
  }
});

router.post('/', async (req, res) => {
  const { perfil, leitor_id, livro_id, data_devolucao_prevista } = req.body;
  if (perfil !== 'leitor') {
    return res.status(403).json({ erro: 'Apenas leitores podem solicitar empréstimos.' });
  }
  if (!leitor_id || !livro_id || !data_devolucao_prevista) {
    return res.status(400).json({ erro: 'Dados incompletos para o empréstimo.' });
  }
  try {
    const [livros] = await db.query('SELECT * FROM livros WHERE id = ?', [livro_id]);
    if (livros.length === 0) {
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }
    if (livros[0].quantidade_disponivel <= 0) {
      return res.status(400).json({ erro: 'Livro sem estoque disponível.' });
    }
    const hoje = new Date().toISOString().split('T')[0];
    await db.query(
      'INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, ?)',
      [livro_id, leitor_id, hoje, data_devolucao_prevista, 'ativo']
    );
    await db.query(
      'UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?',
      [livro_id]
    );
    res.status(201).json({ mensagem: 'Empréstimo registrado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar empréstimo.' });
  }
});

router.put('/:id/devolver', async (req, res) => {
  const { perfil } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem aprovar devoluções.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM emprestimos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
    }
    if (rows[0].status === 'devolvido') {
      return res.status(400).json({ erro: 'Empréstimo já devolvido.' });
    }
    const hoje = new Date().toISOString().split('T')[0];
    await db.query(
      'UPDATE emprestimos SET status = ?, data_devolucao_real = ? WHERE id = ?',
      ['devolvido', hoje, req.params.id]
    );
    await db.query(
      'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
      [rows[0].livro_id]
    );
    res.json({ mensagem: 'Devolução registrada com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar devolução.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { perfil } = req.body;
  if (perfil !== 'bibliotecario') {
    return res.status(403).json({ erro: 'Apenas bibliotecários podem cancelar empréstimos.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM emprestimos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
    }
    if (rows[0].status !== 'devolvido') {
      await db.query(
        'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
        [rows[0].livro_id]
      );
    }
    await db.query('DELETE FROM emprestimos WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Empréstimo cancelado.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cancelar empréstimo.' });
  }
});

module.exports = router;
