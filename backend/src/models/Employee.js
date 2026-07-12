const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emp_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  first_name: { type: DataTypes.STRING(50), allowNull: false },
  last_name: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(20) },
  designation: { type: DataTypes.STRING(100), allowNull: false },
  dept_id: { type: DataTypes.INTEGER, allowNull: false },
  service_id: { type: DataTypes.INTEGER },
  salary: { type: DataTypes.DECIMAL(10, 2) },
  join_date: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('active', 'inactive', 'on_leave'), defaultValue: 'active' }
}, { tableName: 'employees' });

module.exports = Employee;
