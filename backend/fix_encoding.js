/**
 * Script fix encoding tiếng Việt trong DB
 * Chạy: node fix_encoding.js
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
    }
  }
);

const serviceDescriptions = {
  1: 'Hỗ trợ kỹ thuật qua điện thoại 24/7 cho khách hàng',
  2: 'Dịch vụ chăm sóc khách hàng, nhận đơn hàng, hỗ trợ không kỹ thuật',
  3: 'Gọi ra cho khách hàng để promotion sản phẩm và kiểm tra sự hài lòng',
  4: 'Marketing và quảng bá sản phẩm/dịch vụ qua điện thoại',
  5: 'Hỗ trợ kỹ thuật qua điện thoại 24/7 cho khách hàng',
  6: 'Dịch vụ chăm sóc khách hàng, nhận đơn hàng, hỗ trợ không kỹ thuật',
  7: 'Gọi ra cho khách hàng để promotion sản phẩm và kiểm tra sự hài lòng',
  8: 'Tele marketing và quảng bá thương hiệu doanh nghiệp',
  9: 'Hỗ trợ kỹ thuật đặc biệt cho doanh nghiệp lớn',
  10: 'Dịch vụ outbound sales chuyên nghiệp cho B2B',
};

const serviceNames = {
  1: 'In-bound Technical Support',
  2: 'In-bound Customer Service',
  3: 'Out-bound Sales',
  4: 'Tele Marketing',
  5: 'In-bound Technical Support Premium',
  6: 'In-bound Customer Service Basic',
  7: 'Out-bound Sales Pro',
  8: 'Tele Marketing Premium',
  9: 'Enterprise Technical Support',
  10: 'B2B Out-bound Sales',
};

const departmentDescriptions = {
  1: 'Quản lý nhân sự, tuyển dụng, đào tạo nhân viên',
  2: 'Quản lý hành chính, văn phòng và tài sản công ty',
  3: 'Thực hiện các dịch vụ In-bound, Out-bound và Tele Marketing',
  4: 'Đào tạo và phát triển kỹ năng nhân viên',
  5: 'Xử lý sự cố kỹ thuật: máy tính, phần mềm, bảo mật hệ thống',
  6: 'Kiểm toán tài chính và đánh giá chất lượng dịch vụ',
};

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    // Fix charset for services table
    await sequelize.query("ALTER TABLE services CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    console.log('✅ Altered services table charset');

    // Fix charset for all main tables
    const tables = ['clients', 'employees', 'departments', 'call_logs', 'payments', 'client_services', 'client_products', 'users'];
    for (const table of tables) {
      try {
        await sequelize.query(`ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        console.log(`✅ Altered ${table} charset`);
      } catch(e) {
        console.log(`⚠️  Could not alter ${table}: ${e.message}`);
      }
    }

    // Update service descriptions with correct Vietnamese text
    for (const [id, desc] of Object.entries(serviceDescriptions)) {
      await sequelize.query(
        `UPDATE services SET description = ? WHERE id = ?`,
        { replacements: [desc, parseInt(id)] }
      );
    }
    console.log('✅ Updated service descriptions');

    // Update department descriptions
    for (const [id, desc] of Object.entries(departmentDescriptions)) {
      await sequelize.query(
        `UPDATE departments SET description = ? WHERE id = ?`,
        { replacements: [desc, parseInt(id)] }
      );
    }
    console.log('✅ Updated department descriptions');

    // Verify services
    const [results] = await sequelize.query('SELECT id, name, description FROM services ORDER BY id');
    console.log('\n📋 Services after fix:');
    results.forEach(r => console.log(`  [${r.id}] ${r.name}: ${r.description?.substring(0, 50)}`));

    // Verify departments
    const [deptResults] = await sequelize.query('SELECT id, name, description FROM departments LIMIT 6');
    console.log('\n📋 Departments after fix:');
    deptResults.forEach(d => console.log(`  [${d.id}] ${d.name}: ${d.description}`));

    console.log('\n✅ All encoding fixes applied!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();

