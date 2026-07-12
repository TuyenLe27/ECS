const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  manager_name: { type: DataTypes.STRING(100) },
  is_active: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, { tableName: 'departments' });

module.exports = Department;
