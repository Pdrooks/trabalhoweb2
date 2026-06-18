const bcrypt = require('bcrypt');

const db = {
  usuarios: [],
  livros: [
    { id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano_publicacao: 1899, quantidade_disponivel: 3 },
    { id: 2, titulo: 'O Cortiço', autor: 'Aluísio Azevedo', ano_publicacao: 1890, quantidade_disponivel: 2 },
    { id: 3, titulo: 'Capitães da Areia', autor: 'Jorge Amado', ano_publicacao: 1937, quantidade_disponivel: 4 },
  ],
  emprestimos: [],
  ids: { usuario: 3, livro: 4, emprestimo: 1 },
};

async function iniciar() {
  const hash = await bcrypt.hash('1234', 10);
  db.usuarios.push({ id: 1, nome: 'Ana Bibliotecária', email: 'ana@biblioteca.com', senha: hash, perfil: 'bibliotecario' });
  db.usuarios.push({ id: 2, nome: 'Carlos Leitor', email: 'carlos@email.com', senha: hash, perfil: 'leitor' });
}

module.exports = { db, iniciar };
