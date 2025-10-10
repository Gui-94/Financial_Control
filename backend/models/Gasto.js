const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Gasto = sequelize.define('Gasto', {
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true
  },
});

module.exports = Gasto;
