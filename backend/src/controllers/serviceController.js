const { Service } = require('../models');

// GET /api/services
const getAll = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [['id', 'ASC']] });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/services/:id
const getById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/services
const create = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ message: 'Tạo dịch vụ thành công', service });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/services/:id
const update = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    await service.update(req.body);
    res.json({ message: 'Cập nhật thành công', service });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/services/:id
const remove = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    await service.destroy();
    res.json({ message: 'Xóa dịch vụ thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
