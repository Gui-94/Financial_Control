// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// --- Configurações ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve o frontend

// Usuário fixo
const USUARIO = {
  email: 'admin@teste.com',
  senha: '123456'
};

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ error: 'Email e senha são obrigatórios!' });
  } else if (email !== USUARIO.email) {
    res.status(401).json({ error: 'Usuário não encontrado!' });
  } else if (senha !== USUARIO.senha) {
    res.status(401).json({ error: 'Senha incorreta!' });
  } else {
    res.json({ message: 'Login bem-sucedido!' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

// Bloqueia acesso se não estiver logado
if (!localStorage.getItem('logado')) {
  window.location.href = 'login.html';
}
