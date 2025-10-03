// backend/models/Gasto.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Gasto = sequelize.define('Gasto', {
    descricao: {
      type: DataTypes.STRING,
      allowNull: false
    },
    valor: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return Gasto;
};
