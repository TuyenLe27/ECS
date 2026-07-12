const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClientService = sequelize.define('ClientService', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  service_id: { type: DataTypes.INTEGER, allowNull: false },
  num_employees: { type: DataTypes.INTEGER, defaultValue: 1 },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY },
  total_days: { type: DataTypes.INTEGER },
  total_charge: { type: DataTypes.DECIMAL(12, 2) },
  status: { type: DataTypes.ENUM('active', 'completed', 'cancelled'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'client_services' });

module.exports = ClientService;
