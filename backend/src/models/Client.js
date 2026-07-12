const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  company_name: { type: DataTypes.STRING(150), allowNull: false },
  contact_person: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(100) },
  country: { type: DataTypes.STRING(100), defaultValue: 'Vietnam' },
  industry: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'clients' });

module.exports = Client;
