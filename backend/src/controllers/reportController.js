const { sequelize } = require('../config/database');
const { Client, Service, Employee, Payment, CallLog, ClientService } = require('../models');
const { Op } = require('sequelize');
const excelService = require('../services/excelService');
const pdfService = require('../services/pdfService');

// GET /api/reports/dashboard - Số liệu tổng quan cho Dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalClients, totalEmployees, totalServices, overduePayments] = await Promise.all([
      Client.count({ where: { status: 'active' } }),
      Employee.count({ where: { status: 'active' } }),
      Service.count({ where: { is_active: 1 } }),
      Payment.count({ where: { status: 'overdue' } })
    ]);

    const revenueByMonth = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('due_date'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { status: 'paid' },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('due_date'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('due_date'), '%Y-%m'), 'DESC']],
      limit: 6
    });
    revenueByMonth.reverse();

    const clientsByService = await ClientService.findAll({
      attributes: ['service_id', [sequelize.fn('COUNT', sequelize.col('client_id')), 'count']],
      where: { status: 'active' },
      include: [{ model: Service, as: 'service', attributes: ['name', 'type'] }],
      group: ['service_id']
    });

    const paymentStats = await Payment.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['status']
    });

    res.json({ totalClients, totalEmployees, totalServices, overduePayments, revenueByMonth, clientsByService, paymentStats });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/reports/preview?type=clients|payments|employees|late_payments&from=&to=&status=&service_id=
const getReportPreview = async (req, res) => {
  try {
    const { type, from, to, status, service_id } = req.query;
    let preview = {};

    if (type === 'clients') {
      const total = await Client.count();
      const active = await Client.count({ where: { status: 'active' } });
      const inactive = await Client.count({ where: { status: 'inactive' } });
      preview = { total, active, inactive };

    } else if (type === 'payments' || type === 'late_payments') {
      const where = {};
      if (from && to) where.due_date = { [Op.between]: [from, to] };
      if (type === 'late_payments') where.status = 'overdue';
      else if (status) where.status = status;

      const total = await Payment.count({ where });
      const sumResult = await Payment.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
        where
      });
      const totalAmount = parseFloat(sumResult?.dataValues?.total || 0);
      preview = { total, totalAmount: totalAmount.toLocaleString() };

    } else if (type === 'employees') {
      const where = {};
      if (service_id) where.service_id = service_id;
      const total = await Employee.count({ where });
      const active = await Employee.count({ where: { ...where, status: 'active' } });
      const byService = await Employee.count({ where: { service_id: { [Op.not]: null } } });
      preview = { total, active, byService };
    }

    res.json({ type, preview });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/reports/export-excel?type=clients|payments|employees|late_payments&from=&to=&status=&service_id=
const exportExcel = async (req, res) => {
  try {
    const { type, from, to, status, service_id } = req.query;
    const buffer = await excelService.generate(type, { from, to, status, service_id });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=ecs_${type}_report.xlsx`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xuất Excel', error: err.message });
  }
};

// GET /api/reports/export-pdf?type=payments|clients|employees|late_payments&from=&to=&status=&service_id=
const exportPdf = async (req, res) => {
  try {
    const { type, from, to, status, service_id } = req.query;
    const buffer = await pdfService.generate(type, { from, to, status, service_id });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ecs_${type}_report.pdf`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xuất PDF', error: err.message });
  }
};

// GET /api/reports/employee-performance
const getEmployeePerformance = async (req, res) => {
  try {
    const list = await CallLog.findAll({
      attributes: [
        'employee_id',
        [sequelize.fn('COUNT', sequelize.col('CallLog.id')), 'totalCalls'],
        [sequelize.fn('SUM', sequelize.col('duration_minutes')), 'totalMinutes'],
        [sequelize.literal("SUM(CASE WHEN outcome = 'resolved' OR outcome = 'completed' THEN 1 ELSE 0 END)"), 'resolvedCalls']
      ],
      include: [{ 
        model: Employee, 
        as: 'employee', 
        attributes: ['first_name', 'last_name', 'emp_code'],
        include: [{ model: Service, as: 'service', attributes: ['name'] }]
      }],
      where: { employee_id: { [Op.not]: null } },
      group: ['employee_id', 'employee.id', 'employee.emp_code', 'employee->service.id'],
      order: [[sequelize.literal('totalCalls'), 'DESC']]
    });

    const performance = list.map(item => {
      const totalCalls = parseInt(item.dataValues.totalCalls || 0);
      const resolvedCalls = parseInt(item.dataValues.resolvedCalls || 0);
      const successRate = totalCalls > 0 ? parseFloat(((resolvedCalls / totalCalls) * 100).toFixed(1)) : 0;
      return {
        employeeId: item.employee_id,
        name: item.employee ? `${item.employee.last_name} ${item.employee.first_name}` : 'Unknown',
        empCode: item.employee ? item.employee.emp_code : '-',
        serviceName: item.employee?.service ? item.employee.service.name : 'N/A',
        totalCalls,
        totalMinutes: parseInt(item.dataValues.totalMinutes || 0),
        successRate
      };
    });

    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getDashboard, getReportPreview, exportExcel, exportPdf, getEmployeePerformance };

