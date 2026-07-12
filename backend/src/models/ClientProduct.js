const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClientProduct = sequelize.define('ClientProduct', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  product_name: { type: DataTypes.STRING(150), allowNull: false },
  category: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2) },
  is_active: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, { tableName: 'client_products' });

module.exports = ClientProduct;
