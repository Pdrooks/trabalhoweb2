const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/livros', livrosRoutes);
app.use('/emprestimos', emprestimosRoutes);

const porta = process.env.PORT || 3000;
app.listen(porta, () => console.log(`Servidor rodando na porta ${porta}`));
