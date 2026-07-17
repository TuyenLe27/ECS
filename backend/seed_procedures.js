/**
 * Script seed dữ liệu mẫu cho Quy trình hỗ trợ khách hàng
 */
const { ClientProcedure } = require('./src/models');

const procedures = [
  {
    client_id: 1,
    title: 'Quy trình xử lý lỗi màn hình điện thoại Samsung',
    steps: '1. Tiếp nhận cuộc gọi hỗ trợ từ khách hàng sử dụng điện thoại Samsung.\n2. Hỏi khách hàng về hiện tượng lỗi (sọc màn hình, nhấp nháy, tối đen).\n3. Kiểm tra thông tin kích hoạt bảo hành điện tử thông qua IMEI.\n4. Hướng dẫn khách hàng thử khởi động lại máy bằng cách giữ phím Nguồn + Giảm âm lượng trong 10 giây.\n5. Nếu vẫn lỗi, tư vấn khách hàng mang máy đến trung tâm bảo hành Samsung gần nhất.\n6. Ghi lại kết quả cuộc gọi vào hệ thống.',
    is_active: true
  },
  {
    client_id: 3,
    title: 'Quy trình đổi trả sữa bột Vinamilk bị vón cục',
    steps: '1. Hỏi thăm tình trạng sức khỏe của bé và khách hàng.\n2. Ghi nhận thông tin chi tiết: Tên sản phẩm, Lô sản xuất (Lot), Hạn sử dụng (EXP).\n3. Hỏi khách hàng về điều kiện bảo quản sữa tại nhà.\n4. Thông báo bộ phận kiểm định chất lượng của Vinamilk sẽ liên hệ thu hồi mẫu sữa trong vòng 24 giờ.\n5. Hướng dẫn đại lý hoặc siêu thị nơi khách hàng mua tiến hành đổi hộp mới cho khách hàng miễn phí.\n6. Cảm ơn khách hàng đã phản hồi đóng góp ý kiến.',
    is_active: true
  },
  {
    client_id: 5,
    title: 'Quy trình tiếp nhận sửa chữa Điều hòa Panasonic tại nhà',
    steps: '1. Chào hỏi theo đúng quy chuẩn Panasonic Care.\n2. Ghi nhận lỗi thiết bị (không mát, chảy nước, báo lỗi đèn đỏ).\n3. Tra cứu thông tin bảo hành của sản phẩm dựa trên số serial.\n4. Xác nhận chi phí: Miễn phí nếu còn trong thời gian bảo hành, Báo giá theo bảng phí hãng nếu ngoài bảo hành.\n5. Lên lịch hẹn với kỹ thuật viên khu vực và thông báo thời gian hẹn cụ thể cho khách hàng.\n6. Ghi nhận cuộc gọi hoàn tất.',
    is_active: true
  },
  {
    client_id: 4,
    title: 'Quy trình kích hoạt dùng thử FPT Cloud Services',
    steps: '1. Chào khách hàng và hỏi nhu cầu trải nghiệm dịch vụ Cloud (VM, Storage, Database).\n2. Hướng dẫn khách hàng truy cập portal portal.fptcloud.com.\n3. Hướng dẫn nhập thông tin đăng ký doanh nghiệp và số điện thoại xác thực.\n4. Hỗ trợ kích hoạt gói credit dùng thử trị giá $100 sử dụng trong 30 ngày.\n5. Gửi tài liệu hướng dẫn sử dụng nhanh qua email khách hàng đăng ký.\n6. Đặt lịch cuộc gọi chăm sóc sau 3 ngày.',
    is_active: true
  }
];

const seed = async () => {
  try {
    console.log('🌱 Seeding procedures...');
    for (const proc of procedures) {
      await ClientProcedure.create({
        ...proc,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    console.log('✅ Seeded procedures successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
