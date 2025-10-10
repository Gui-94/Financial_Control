const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('financial_control', 'root', 'SENHA_DO_SEU_BANCO', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao MySQL com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar ao MySQL:', err));

module.exports = sequelize;
