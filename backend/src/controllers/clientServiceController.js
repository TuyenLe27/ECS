const { ClientService, Client, Service, User, Employee } = require('../models');
const moment = require('moment');

// Tính tổng phí: charge_per_day × num_employees × total_days
const calculateCharge = (chargePerDay, numEmployees, startDate, endDate) => {
  const days = endDate
    ? moment(endDate).diff(moment(startDate), 'days') + 1
    : moment().diff(moment(startDate), 'days') + 1;
  return { totalDays: days, totalCharge: chargePerDay * numEmployees * days };
};

// GET /api/client-services
const getAll = async (req, res) => {
  try {
    const { client_id, service_id, status } = req.query;
    const where = {};
    if (client_id) where.client_id = client_id;
    if (service_id) where.service_id = service_id;
    if (status) where.status = status;

    if (req.user.role === 'staff') {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.employee_id) {
        const emp = await Employee.findByPk(userRecord.employee_id);
        if (emp && emp.service_id) {
          where.service_id = emp.service_id;
        } else {
          return res.json([]);
        }
      } else {
        return res.json([]);
      }
    }
    const list = await ClientService.findAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'company_name', 'client_code'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'type', 'charge_per_day'] }
      ],
      order: [['start_date', 'DESC']]
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/client-services (tự tính phí)
const create = async (req, res) => {
  try {
    const service = await Service.findByPk(req.body.service_id);
    if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    const { totalDays, totalCharge } = calculateCharge(
      service.charge_per_day, req.body.num_employees,
      req.body.start_date, req.body.end_date
    );
    const cs = await ClientService.create({ ...req.body, total_days: totalDays, total_charge: totalCharge });
    res.status(201).json({ message: 'Đăng ký dịch vụ thành công', cs, totalCharge });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/client-services/:id
const update = async (req, res) => {
  try {
    const cs = await ClientService.findByPk(req.params.id, {
      include: [{ model: Service, as: 'service' }]
    });
    if (!cs) return res.status(404).json({ message: 'Không tìm thấy' });
    // Tính lại phí nếu có thay đổi số ngày hoặc số nhân viên
    const numEmp = req.body.num_employees || cs.num_employees;
    const start = req.body.start_date || cs.start_date;
    const end = req.body.end_date || cs.end_date;
    const { totalDays, totalCharge } = calculateCharge(cs.service.charge_per_day, numEmp, start, end);
    await cs.update({ ...req.body, total_days: totalDays, total_charge: totalCharge });
    res.json({ message: 'Cập nhật thành công', cs });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/client-services/:id
const remove = async (req, res) => {
  try {
    const cs = await ClientService.findByPk(req.params.id);
    if (!cs) return res.status(404).json({ message: 'Không tìm thấy' });
    await cs.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
