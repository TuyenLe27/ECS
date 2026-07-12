const { Op } = require('sequelize');
const { Payment, Client, ClientService, Service } = require('../models');
const moment = require('moment');

// Tự động cập nhật payment overdue
const updateOverduePayments = async () => {
  await Payment.update(
    { status: 'overdue' },
    { where: { status: 'pending', due_date: { [Op.lt]: new Date() } } }
  );
};

// GET /api/payments?status=&client_id=&from=&to=
const getAll = async (req, res) => {
  try {
    await updateOverduePayments();
    const { status, client_id, from, to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (client_id) where.client_id = client_id;
    if (from && to) where.due_date = { [Op.between]: [from, to] };
    const payments = await Payment.findAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'company_name', 'client_code'] },
        { model: ClientService, as: 'clientService', include: [{ model: Service, as: 'service' }] }
      ],
      order: [['due_date', 'ASC']]
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/payments/overdue
const getOverdue = async (req, res) => {
  try {
    await updateOverduePayments();
    const payments = await Payment.findAll({
      where: { status: 'overdue' },
      include: [{ model: Client, as: 'client', attributes: ['id', 'company_name', 'client_code', 'email', 'phone'] }],
      order: [['due_date', 'ASC']]
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/payments
const create = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({ message: 'Tạo thanh toán thành công', payment });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/payments/:id (đánh dấu đã thanh toán hoặc cập nhật)
const update = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    // Nếu mark paid mà chưa có paid_date thì tự điền ngày hôm nay
    if (req.body.status === 'paid' && !req.body.paid_date) {
      req.body.paid_date = moment().format('YYYY-MM-DD');
    }
    await payment.update(req.body);
    res.json({ message: 'Cập nhật thành công', payment });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/payments/:id
const remove = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    await payment.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, getOverdue, create, update, remove };
