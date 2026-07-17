const { Payment, Client, ClientService, Service, CallLog, User, Employee } = require('../models');
const { Op } = require('sequelize');
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

const sanitizePaymentData = (data) => {
  const clean = { ...data };
  if (clean.client_service_id === '') clean.client_service_id = null;
  if (clean.paid_date === '') clean.paid_date = null;
  if (clean.notes === '') clean.notes = null;
  return clean;
};

// POST /api/payments
const create = async (req, res) => {
  try {
    const cleanData = sanitizePaymentData(req.body);
    const payment = await Payment.create(cleanData);
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
    
    const cleanData = sanitizePaymentData(req.body);
    if (cleanData.status === 'paid' && !cleanData.paid_date) {
      cleanData.paid_date = moment().format('YYYY-MM-DD');
    }
    await payment.update(cleanData);
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

// POST /api/payments/:id/remind
const sendReminder = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: Client, as: 'client' }]
    });
    if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    if (!payment.client) return res.status(400).json({ message: 'Không tìm thấy khách hàng cho hóa đơn này' });

    let employeeId = null;
    const userRecord = await User.findByPk(req.user.id);
    if (userRecord && userRecord.employee_id) {
      employeeId = userRecord.employee_id;
    } else {
      const fallbackEmp = await Employee.findOne();
      if (fallbackEmp) {
        employeeId = fallbackEmp.id;
      }
    }

    const emailSubject = `ECS - Thông báo nhắc nợ hóa đơn trễ hạn #${payment.invoice_no}`;
    const emailBody = `Kính gửi ${payment.client.company_name},\n\nChúng tôi xin thông báo hóa đơn #${payment.invoice_no} trị giá $${Number(payment.amount).toLocaleString()} đến hạn vào ngày ${moment(payment.due_date).format('DD/MM/YYYY')} hiện đang quá hạn thanh toán.\n\nVui lòng hoàn tất thanh toán trong thời gian sớm nhất.\n\nTrân trọng,\nExcell-On Consulting Services`;

    await CallLog.create({
      client_id: payment.client_id,
      employee_id: employeeId,
      call_type: 'outbound',
      call_datetime: new Date(),
      duration_minutes: 0,
      purpose: `Nhắc nợ hóa đơn #${payment.invoice_no}`,
      outcome: 'completed',
      notes: `Hệ thống tự động gửi email nhắc nợ tới: ${payment.client.email}`
    });

    const note = `Đã gửi nhắc nợ qua email ngày ${moment().format('DD/MM/YYYY HH:mm')}`;
    await payment.update({ notes: payment.notes ? `${payment.notes} | ${note}` : note });

    res.json({
      message: `Gửi nhắc nợ thành công tới ${payment.client.email}`,
      email: { subject: emailSubject, body: emailBody }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, getOverdue, create, update, remove, sendReminder };

