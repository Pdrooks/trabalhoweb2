const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { db } = require('../data');

router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, perfil } = req.body;
  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }
  if (db.usuarios.find(u => u.email === email)) {
    return res.status(409).json({ erro: 'E-mail já cadastrado.' });
  }
  const hash = await bcrypt.hash(senha, 10);
  const novo = { id: db.ids.usuario++, nome, email, senha: hash, perfil };
  db.usuarios.push(novo);
  res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.' });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }
  const usuario = db.usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }
  const ok = await bcrypt.compare(senha, usuario.senha);
  if (!ok) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }
  res.json({
    mensagem: 'Login realizado com sucesso.',
    usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
  });
});

module.exports = router;
