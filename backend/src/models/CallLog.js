const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CallLog = sequelize.define('CallLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  call_type: { type: DataTypes.ENUM('inbound', 'outbound', 'telemarketing'), allowNull: false },
  call_datetime: { type: DataTypes.DATE, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  purpose: { type: DataTypes.STRING(200) },
  outcome: {
    type: DataTypes.ENUM('resolved', 'callback', 'no_answer', 'escalated', 'completed'),
    defaultValue: 'resolved'
  },
  notes: { type: DataTypes.TEXT },
  recording_url: { type: DataTypes.STRING(500), allowNull: true },
  recording_sid: { type: DataTypes.STRING(100), allowNull: true },
}, { tableName: 'call_logs', updatedAt: false });

module.exports = CallLog;
