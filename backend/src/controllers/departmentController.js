const { Department, Employee } = require('../models');

// GET /api/departments
const getAll = async (req, res) => {
  try {
    const departments = await Department.findAll({ order: [['name', 'ASC']] });
    res.json(departments);
  } catch (err) {
    console.error('Error in getAll departments:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/departments/:id
const getById = async (req, res) => {
  try {
    const dept = await Department.findByPk(req.params.id, {
      include: [{ model: Employee, as: 'employees' }]
    });
    if (!dept) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    res.json(dept);
  } catch (err) {
    console.error('Error in getById department:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/departments
const create = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ message: 'Tạo phòng ban thành công', dept });
  } catch (err) {
    console.error('Error in create department:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Mã phòng ban đã tồn tại trong hệ thống' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/departments/:id
const update = async (req, res) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    await dept.update(req.body);
    res.json({ message: 'Cập nhật thành công', dept });
  } catch (err) {
    console.error('Error in update department:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Mã phòng ban đã tồn tại trong hệ thống' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/departments/:id
const remove = async (req, res) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    await dept.destroy();
    res.json({ message: 'Xóa phòng ban thành công' });
  } catch (err) {
    console.error('Error in remove department:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };

