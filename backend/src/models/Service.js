const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  type: { type: DataTypes.ENUM('inbound', 'outbound', 'telemarketing'), allowNull: false },
  description: { type: DataTypes.TEXT },
  charge_per_day: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  is_active: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, { tableName: 'services' });

module.exports = Service;
