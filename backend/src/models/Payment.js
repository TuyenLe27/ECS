const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  client_service_id: { type: DataTypes.INTEGER },
  invoice_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  due_date: { type: DataTypes.DATEONLY, allowNull: false },
  paid_date: { type: DataTypes.DATEONLY },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'cash', 'cheque', 'online'),
    defaultValue: 'bank_transfer'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'partial'),
    defaultValue: 'pending'
  },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'payments' });

module.exports = Payment;
