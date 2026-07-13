const { ClientProduct, Client, User, Employee, ClientService } = require('../models');

// GET /api/client-products?client_id=
const getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.client_id) where.client_id = req.query.client_id;

    let includeClause = [{ model: Client, as: 'client', attributes: ['id', 'company_name'] }];

    if (req.user.role === 'staff') {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.employee_id) {
        const emp = await Employee.findByPk(userRecord.employee_id);
        if (emp && emp.service_id) {
          includeClause[0].include = [{
            model: ClientService,
            as: 'clientServices',
            where: { service_id: emp.service_id },
            required: true
          }];
        } else {
          return res.json([]);
        }
      } else {
        return res.json([]);
      }
    }

    const products = await ClientProduct.findAll({
      where,
      include: includeClause,
      order: [['product_name', 'ASC']]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/client-products
const create = async (req, res) => {
  try {
    const product = await ClientProduct.create(req.body);
    res.status(201).json({ message: 'Thêm sản phẩm thành công', product });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/client-products/:id
const update = async (req, res) => {
  try {
    const product = await ClientProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    await product.update(req.body);
    res.json({ message: 'Cập nhật thành công', product });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/client-products/:id
const remove = async (req, res) => {
  try {
    const product = await ClientProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    await product.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
