// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Op } = require('sequelize');
const sequelize = require('./database'); // ✅ conexão MySQL
const Gasto = require('./models/Gasto'); // ✅ modelo MySQL

const app = express();
const PORT = 3000;

// --- Configurações ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve o frontend

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
  const gastos = await Gasto.findAll({ order: [['createdAt', 'DESC']] });
  res.json(gastos);
});

// Resumo por mês
app.get('/resumo', async (req, res) => {
  const { month } = req.query;

  const gastos = await Gasto.findAll({
    where: {
      createdAt: { [Op.like]: `${month}%` }
    },
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
sequelize.sync()
  .then(() => {
    console.log('📦 Tabelas sincronizadas com o MySQL');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('❌ Erro ao sincronizar banco:', err));
