const { Op } = require('sequelize');
const { CallLog, Client, Employee } = require('../models');

// GET /api/call-logs?client_id=&employee_id=&call_type=&from=&to=
const getAll = async (req, res) => {
  try {
    const { client_id, employee_id, call_type, from, to } = req.query;
    const where = {};
    if (client_id) where.client_id = client_id;
    if (employee_id) where.employee_id = employee_id;
    if (call_type) where.call_type = call_type;
    if (from && to) where.call_datetime = { [Op.between]: [from, to] };
    const logs = await CallLog.findAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'company_name'] },
        { model: Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'emp_code'] }
      ],
      order: [['call_datetime', 'DESC']]
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/call-logs
const create = async (req, res) => {
  try {
    const log = await CallLog.create(req.body);
    res.status(201).json({ message: 'Tạo call log thành công', log });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/call-logs/:id
const update = async (req, res) => {
  try {
    const log = await CallLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Không tìm thấy call log' });
    await log.update(req.body);
    res.json({ message: 'Cập nhật thành công', log });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/call-logs/:id
const remove = async (req, res) => {
  try {
    const log = await CallLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Không tìm thấy call log' });
    await log.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
