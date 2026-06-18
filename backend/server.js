const express = require('express');
const cors = require('cors');
const { iniciar } = require('./data');

const authRoutes = require('./routes/auth');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/livros', livrosRoutes);
app.use('/emprestimos', emprestimosRoutes);

iniciar().then(() => {
  app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
});
