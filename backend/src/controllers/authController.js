const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username và password là bắt buộc' });
    }

    const user = await User.findOne({
      where: { username, is_active: 1 },
      include: [{ model: Employee, as: 'employee' }]
    });

    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa' });

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' });

    // Cập nhật thời gian đăng nhập cuối
    await user.update({ last_login: new Date() });

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id, username: user.username,
        full_name: user.full_name, role: user.role, email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Employee, as: 'employee' }]
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    const hash = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash: hash });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { login, getMe, changePassword };
