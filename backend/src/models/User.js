const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  full_name: { type: DataTypes.STRING(100) },
  role: { type: DataTypes.ENUM('admin', 'manager', 'staff'), defaultValue: 'staff' },
  employee_id: { type: DataTypes.INTEGER },
  is_active: { type: DataTypes.TINYINT(1), defaultValue: 1 },
  last_login: { type: DataTypes.DATE }
}, { tableName: 'users' });

module.exports = User;
