const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    const hash = await bcrypt.hash('Admin@123', 10);
    await sequelize.query(
      `UPDATE users SET password_hash = '${hash}' WHERE username IN ('admin', 'manager', 'staff1')`
    );
    console.log('✅ Passwords updated successfully!');
    console.log('Login: admin / Admin@123');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

fixPasswords();
