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

const procedureData = {
  1: {
    title: 'Quy trình xử lý lỗi màn hình điện thoại Samsung',
    steps: '1. Tiếp nhận cuộc gọi hỗ trợ từ khách hàng sử dụng điện thoại Samsung.\n2. Hỏi khách hàng về hiện tượng lỗi (sọc màn hình, nhấp nháy, tối đen).\n3. Kiểm tra thông tin kích hoạt bảo hành điện tử thông qua IMEI.\n4. Hướng dẫn khách hàng thử khởi động lại máy bằng cách giữ phím Nguồn + Giảm âm lượng trong 10 giây.\n5. Nếu vẫn lỗi, tư vấn khách hàng mang máy đến trung tâm bảo hành Samsung gần nhất.\n6. Ghi lại kết quả cuộc gọi vào hệ thống.'
  },
  2: {
    title: 'Quy trình đổi trả sữa bột Vinamilk bị vón cục',
    steps: '1. Hỏi thăm tình trạng sức khỏe của bé và khách hàng.\n2. Ghi nhận thông tin chi tiết: Tên sản phẩm, Lô sản xuất (Lot), Hạn sử dụng (EXP).\n3. Hỏi khách hàng về điều kiện bảo quản sữa tại nhà.\n4. Thông báo bộ phận kiểm định chất lượng của Vinamilk sẽ liên hệ thu hồi mẫu sữa trong vòng 24 giờ.\n5. Hướng dẫn đại lý hoặc siêu thị nơi khách hàng mua tiến hành đổi hộp mới cho khách hàng miễn ý.\n6. Cảm ơn khách hàng đã phản hồi đóng góp ý kiến.'
  },
  3: {
    title: 'Quy trình tiếp nhận sửa chữa Điều hòa Panasonic tại nhà',
    steps: '1. Chào hỏi theo đúng quy chuẩn Panasonic Care.\n2. Ghi nhận lỗi thiết bị (không mát, chảy nước, báo lỗi đèn đỏ).\n3. Tra cứu thông tin bảo hành của sản phẩm dựa trên số serial.\n4. Xác nhận chi phí: Miễn phí nếu còn trong thời gian bảo hành, Báo giá theo bảng phí hãng nếu ngoài bảo hành.\n5. Lên lịch hẹn với kỹ thuật viên khu vực và thông báo thời gian hẹn cụ thể cho khách hàng.\n6. Ghi nhận cuộc gọi hoàn tất.'
  },
  4: {
    title: 'Quy trình kích hoạt dùng thử FPT Cloud Services',
    steps: '1. Chào khách hàng và hỏi nhu cầu trải nghiệm dịch vụ Cloud (VM, Storage, Database).\n2. Hướng dẫn khách hàng truy cập portal portal.fptcloud.com.\n3. Hướng dẫn nhập thông tin đăng ký doanh nghiệp và số điện thoại xác thực.\n4. Hỗ trợ kích hoạt gói credit dùng thử trị giá $100 sử dụng trong 30 ngày.\n5. Gửi tài liệu hướng dẫn sử dụng nhanh qua email khách hàng đăng ký.\n6. Đặt lịch cuộc gọi chăm sóc sau 3 ngày.'
  }
};

const productData = {
  3: 'Tủ lạnh side-by-side 617L',
  4: 'Gói internet cáp quang 200Mbps',
  5: 'Gói internet cáp quang 500Mbps',
  6: 'Gói internet doanh nghiệp tốc độ cao',
  7: 'Sữa tươi tiệt trùng 1 lít',
  8: 'Sữa chua Vinamilk các vị',
  9: 'Dịch vụ cloud computing',
  10: 'Phần mềm quản trị doanh nghiệp',
  11: 'Máy lạnh inverter tiết kiệm điện',
  12: 'Máy giặt cửa trên 9kg'
};

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    // Fix charset for services table
    await sequelize.query("ALTER TABLE services CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    console.log('✅ Altered services table charset');

    // Fix charset for all main tables
    const tables = ['clients', 'employees', 'departments', 'call_logs', 'payments', 'client_services', 'client_products', 'users', 'client_procedures'];
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

    // Update client procedures
    for (const [id, proc] of Object.entries(procedureData)) {
      await sequelize.query(
        `UPDATE client_procedures SET title = ?, steps = ? WHERE id = ?`,
        { replacements: [proc.title, proc.steps, parseInt(id)] }
      );
    }
    console.log('✅ Updated client procedures');

    // Update client products
    for (const [id, desc] of Object.entries(productData)) {
      await sequelize.query(
        `UPDATE client_products SET description = ? WHERE id = ?`,
        { replacements: [desc, parseInt(id)] }
      );
    }
    console.log('✅ Updated client products');

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


