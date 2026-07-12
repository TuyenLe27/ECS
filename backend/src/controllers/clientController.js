const { Op } = require('sequelize');
const { Client, ClientService, ClientProduct, Payment, Service } = require('../models');

// GET /api/clients?search=&status=&industry=&city=
const getAll = async (req, res) => {
  try {
    const { search, status, industry, city } = req.query;
    const where = {};
    if (status) where.status = status;
    if (industry) where.industry = { [Op.like]: `%${industry}%` };
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (search) {
      where[Op.or] = [
        { company_name: { [Op.like]: `%${search}%` } },
        { client_code: { [Op.like]: `%${search}%` } },
        { contact_person: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    const clients = await Client.findAll({
      where,
      include: [
        { model: ClientService, as: 'clientServices', include: [{ model: Service, as: 'service' }] }
      ],
      order: [['company_name', 'ASC']]
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/clients/:id (chi tiết + sản phẩm + thanh toán)
const getById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { model: ClientService, as: 'clientServices', include: [{ model: Service, as: 'service' }] },
        { model: ClientProduct, as: 'products' },
        { model: Payment, as: 'payments' }
      ]
    });
    if (!client) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/clients
const create = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ message: 'Thêm khách hàng thành công', client });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/clients/:id
const update = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    await client.update(req.body);
    res.json({ message: 'Cập nhật thành công', client });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/clients/:id
const remove = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    await client.destroy();
    res.json({ message: 'Xóa khách hàng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
