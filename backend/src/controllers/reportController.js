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

    // Doanh thu theo tháng (6 tháng gần nhất có dữ liệu)
    const revenueByMonth = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('due_date'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        status: 'paid'
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('due_date'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('due_date'), '%Y-%m'), 'DESC']],
      limit: 6
    });

    // Sắp xếp lại theo thứ tự thời gian tăng dần
    revenueByMonth.reverse();

    // Phân bổ client theo service
    const clientsByService = await ClientService.findAll({
      attributes: ['service_id', [sequelize.fn('COUNT', sequelize.col('client_id')), 'count']],
      where: { status: 'active' },
      include: [{ model: Service, as: 'service', attributes: ['name', 'type'] }],
      group: ['service_id']
    });

    // Thanh toán theo trạng thái
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

// GET /api/reports/export-excel?type=clients|payments|employees
const exportExcel = async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const buffer = await excelService.generate(type, { from, to });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=ecs_${type}_report.xlsx`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xuất Excel', error: err.message });
  }
};

// GET /api/reports/export-pdf?type=payments|clients
const exportPdf = async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const buffer = await pdfService.generate(type, { from, to });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ecs_${type}_report.pdf`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xuất PDF', error: err.message });
  }
};

module.exports = { getDashboard, exportExcel, exportPdf };
