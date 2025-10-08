// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, Op } = require('sequelize');
const path = require('path');

const app = express();
const PORT = 3000;

// --- Configurações ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve o frontend

// --- Inicializa SQLite ---
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
});

// --- Importa o modelo ---
const Gasto = require('./models/Gasto')(sequelize);

// --- Rotas ---

// Criar gasto
app.post('/gastos', async (req, res) => {
  try {
    const gasto = await Gasto.create(req.body);
    res.json(gasto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar todos os gastos
app.get('/gastos', async (req, res) => {
  const gastos = await Gasto.findAll({ order: [['data', 'DESC']] });
  res.json(gastos);
});

// Resumo por mês
app.get('/resumo', async (req, res) => {
  const { month } = req.query;
  const gastos = await Gasto.findAll({
    where: { data: { [Op.like]: `${month}%` } },
  });

  const total = gastos.reduce((sum, g) => sum + parseFloat(g.valor), 0);
  const porCategoria = {};
  gastos.forEach((g) => {
    const cat = g.categoria || 'Sem categoria';
    porCategoria[cat] = (porCategoria[cat] || 0) + parseFloat(g.valor);
  });

  res.json({ total, porCategoria });
});

// --- Sincroniza DB e inicia servidor ---
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('Erro ao sincronizar banco:', err));
