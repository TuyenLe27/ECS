-- ============================================================
-- ECS Database - Seed Data (Auto-updated from Local MySQL)
-- Generated: 2026-07-24T02:38:08.224Z
-- ============================================================
USE ecs_db;

-- ============================================================
-- SERVICES (5 records)
-- ============================================================
INSERT INTO services (id, name, type, description, charge_per_day, is_active) VALUES
(1, 'In-bound Technical Support', 'inbound', 'Hỗ trợ kỹ thuật qua điện thoại 24/7 cho khách hàng', '4500.00', 1),
(2, 'In-bound Customer Service', 'inbound', 'Dịch vụ chăm sóc khách hàng, nhận đơn hàng, hỗ trợ không kỹ thuật', '4500.00', 1),
(3, 'Out-bound Sales', 'outbound', 'Gọi ra cho khách hàng để promotion sản phẩm và kiểm tra sự hài lòng', '6000.00', 1),
(4, 'Tele Marketing', 'telemarketing', 'Marketing và quảng bá sản phẩm/dịch vụ qua điện thoại', '5500.00', 1),
(15, 'System Integration', 'inbound', 'System integration services for enterprise clients', '5500.00', 1);

-- ============================================================
-- DEPARTMENTS (9 records)
-- ============================================================
INSERT INTO departments (id, name, code, description, manager_name, is_active) VALUES
(1, 'HR Management', 'HR', 'Quản lý nhân sự, tuyển dụng, đào tạo nhân viên', 'Nguyen Van A', 1),
(2, 'Administration', 'ADM', 'Quản lý hành chính, văn phòng và tài sản công ty', 'Tran Thi B', 1),
(3, 'Service', 'SVC', 'Thực hiện các dịch vụ In-bound, Out-bound và Tele Marketing', 'Le Van C', 1),
(4, 'Training', 'TRN', 'Đào tạo và phát triển kỹ năng nhân viên', 'Pham Thi D', 1),
(5, 'Internet Security', 'IT', 'Xử lý sự cố kỹ thuật: máy tính, phần mềm, bảo mật hệ thống', 'Hoang Van E', 1),
(6, 'Auditors', 'AUD', 'Kiểm toán tài chính và đánh giá chất lượng dịch vụ', 'Vo Thi F', 1),
(30, 'Test Department Creation', 'TDC', 'This is a test', 'Test Manager', 1),
(31, 'New Test Department', 'NTD', NULL, 'Manager Test', 1),
(39, 'Tech Support Services', 'TS', 'Providing tech support for products', NULL, 1);

-- ============================================================
-- EMPLOYEES (12 records)
-- ============================================================
INSERT INTO employees (id, emp_code, first_name, last_name, email, phone, designation, dept_id, service_id, salary, join_date, status) VALUES
(1, 'EMP001', 'Minh', 'Nguyen', 'minh.nguyen@ecs.com', '0901234567', 'Call Center ', 3, 1, '1500.00', '2023-01-14 17:00:00', 'active'),
(2, 'EMP002', 'Lan', 'Tran', 'lan.tran@ecs.com', '0912345678', 'Senior ', 3, 2, '1800.00', '2022-05-31 17:00:00', 'active'),
(3, 'EMP003', 'Hung', 'Le', 'hung.le@ecs.com', '0923456789', 'Outbound Specialist', 3, 3, '1700.00', '2023-03-09 17:00:00', 'active'),
(4, 'EMP004', 'Thu', 'Pham', 'thu.pham@ecs.com', '0934567890', 'Tele Marketer', 3, 4, '1600.00', '2023-05-19 17:00:00', 'active'),
(5, 'EMP005', 'Duc', 'Vo', 'duc.vo@ecs.com', '0945678901', 'HR Officer', 1, NULL, '2000.00', '2021-08-31 17:00:00', 'active'),
(6, 'EMP006', 'Mai', 'Hoang', 'mai.hoang@ecs.com', '0956789012', 'IT Technician', 5, NULL, '2200.00', '2022-01-14 17:00:00', 'active'),
(7, 'EMP007', 'Tuan', 'Dang', 'tuan.dang@ecs.com', '0967890123', 'Team Leader', 3, 1, '2500.00', '2020-02-29 17:00:00', 'active'),
(8, 'EMP008', 'Hoa', 'Bui', 'hoa.bui@ecs.com', '0978901234', 'Training Coordinator', 4, NULL, '1900.00', '2022-08-14 17:00:00', 'active'),
(9, 'EMP099', 'Test', 'Nguyen', 'test.nguyen@ecs.com', '0901111111', 'Test', 3, 1, NULL, NULL, 'active'),
(10, 'EMP010', 'An', 'Van', 'van.an@ecs.com', NULL, 'Staff', 3, 1, '1500.00', '2023-12-31 17:00:00', 'active'),
(14, 'EMP45', 'dfgdg', 'dfdf', 'tuyendzvclluon@gmail.com', '0394654983', 'dfdf', 2, NULL, '1656.00', '2006-03-26 17:00:00', 'active'),
(15, 'EMP009', 'Employee', 'Test', 'test_employee@ecs.com', NULL, 'Staff', 39, 1, NULL, NULL, 'active');

-- ============================================================
-- CLIENTS (7 records)
-- ============================================================
INSERT INTO clients (id, client_code, company_name, contact_person, email, phone, address, city, country, industry, status, notes) VALUES
(1, 'CLI001', 'Samsung Electronics Vietnam', 'Park Jin Ho', 'pjh@samsung.vn', '02438123456', '16 Thai Ha, Dong Da', 'Hanoi', 'Vietnam', 'Electronics', 'active', NULL),
(2, 'CLI002', 'Viettel Telecom', 'Nguyen Quoc Cuong', 'nqc@viettel.vn', '02438234567', '15 Tran Duy Hung, Cau Giay', 'Hanoi', 'Vietnam', 'Telecommunications', 'active', NULL),
(3, 'CLI003', 'Vinamilk Corporation', 'Le Thi Thu Ha', 'ltha@vinamilk.vn', '02838345678', '10 Tan Trao, Tan Phu', 'Ho Chi Minh', 'Vietnam', 'Food & Beverage', 'active', NULL),
(4, 'CLI004', 'FPT Software', 'Tran Minh Tuan', 'tmt@fpt.com.vn', '02438456789', 'FPT Complex, Cau Giay', 'Hanoi', 'Vietnam', 'Information Technology', 'active', NULL),
(5, 'CLI005', 'Panasonic Vietnam', 'Yamamoto Kenji', 'yk@panasonic.vn', '02838567890', 'Lot B1, VSIP II, Binh Duong', 'Binh Duong', 'Vietnam', 'Electronics', 'active', NULL),
(9, 'CLI010', 'fsfsfsf', 'fsfsf', 'tuyendzvclluon@gmail.com', '0987654321', 'êtt', 'ha noi', 'Vietnam', 'it', 'active', 'dgdg'),
(10, 'CLI006', 'Alpha Tech', 'John Doe', 'contact@alphatech.com', NULL, NULL, 'Hanoi', 'Vietnam', 'Technology', 'active', NULL);

-- ============================================================
-- CLIENT_SERVICES (12 records)
-- ============================================================
INSERT INTO client_services (id, client_id, service_id, num_employees, start_date, end_date, total_days, total_charge, status, notes) VALUES
(1, 1, 1, 5, '2023-12-31 17:00:00', '2024-12-30 17:00:00', 365, '8212500.00', 'completed', NULL),
(2, 1, 2, 3, '2023-12-31 17:00:00', '2024-12-30 17:00:00', 365, '4927500.00', 'completed', NULL),
(3, 2, 3, 8, '2024-02-29 17:00:00', '2025-02-27 17:00:00', 365, '17520000.00', 'active', NULL),
(4, 2, 4, 4, '2024-02-29 17:00:00', '2025-02-27 17:00:00', 365, '8030000.00', 'active', NULL),
(5, 3, 2, 6, '2024-05-31 17:00:00', NULL, NULL, NULL, 'active', NULL),
(6, 4, 4, 10, '2024-06-30 17:00:00', NULL, NULL, NULL, 'active', NULL),
(7, 5, 1, 4, '2024-08-31 17:00:00', '2025-08-30 17:00:00', 365, '6570000.00', 'active', NULL),
(11, 9, 2, 5, '2005-03-26 17:00:00', '2006-06-11 17:00:00', 443, '13290000.00', 'active', 'gdgfg'),
(12, 10, 15, 1, '2025-12-31 17:00:00', NULL, 196, '1078000.00', 'active', NULL),
(13, 3, 2, 5, '2026-07-15 17:00:00', '2026-07-20 17:00:00', 6, '135000.00', 'active', NULL),
(14, 3, 2, 5, '2026-07-15 17:00:00', NULL, 1, '22500.00', 'active', NULL),
(16, 9, 15, 15, '2026-07-15 17:00:00', NULL, 1, '82500.00', 'active', NULL);

-- ============================================================
-- CLIENT_PRODUCTS (15 records)
-- ============================================================
INSERT INTO client_products (id, client_id, product_name, category, description, price, is_active) VALUES
(1, 1, 'Samsung Galaxy S24', 'Smartphone', 'Flagship smartphone 2024', '999.00', 1),
(2, 1, 'Samsung 4K QLED TV 65"', 'Television', 'Smart TV 4K QLED 65 inch', '1499.00', 1),
(3, 1, 'Samsung Side-by-Side Refrigerator', 'Home Appliance', 'Tủ lạnh side-by-side 617L', '1299.00', 1),
(4, 2, 'Viettel Fiber 200Mbps', 'Internet', 'Gói internet cáp quang 200Mbps', '250000.00', 1),
(5, 2, 'Viettel Fiber 500Mbps', 'Internet', 'Gói internet cáp quang 500Mbps', '399000.00', 1),
(6, 2, 'Viettel Business Pro', 'Internet', 'Gói internet doanh nghiệp tốc độ cao', '1500000.00', 1),
(7, 3, 'Vinamilk Fresh Milk 1L', 'Dairy', 'Sữa tươi tiệt trùng 1 lít', '32000.00', 1),
(8, 3, 'Vinamilk Yogurt', 'Dairy', 'Sữa chua Vinamilk các vị', '15000.00', 1),
(9, 4, 'FPT Cloud Services', 'Cloud', 'Dịch vụ cloud computing', '5000000.00', 1),
(10, 4, 'FPT ERP Solution', 'Software', 'Phần mềm quản trị doanh nghiệp', '50000000.00', 1),
(11, 5, 'Panasonic Inverter AC 12000 BTU', 'Air Conditioner', 'Máy lạnh inverter tiết kiệm điện', '12500000.00', 1),
(12, 5, 'Panasonic Washing Machine 9kg', 'Home Appliance', 'Máy giặt cửa trên 9kg', '7500000.00', 1),
(16, 9, 'gfjfgjgjgjg', 'dỉn', 'rỳyr', '56565.00', 1),
(17, 10, 'Enterprise ERP', 'Software', NULL, '50000.00', 1),
(18, 9, 'gdgdg', 'Electronics', NULL, '5600.00', 1);

-- ============================================================
-- CLIENT_PROCEDURES (4 records)
-- ============================================================
INSERT INTO client_procedures (id, client_id, title, steps, is_active) VALUES
(1, 1, 'Quy trình xử lý lỗi màn hình điện thoại Samsung', '1. Tiếp nhận cuộc gọi hỗ trợ từ khách hàng sử dụng điện thoại Samsung.
2. Hỏi khách hàng về hiện tượng lỗi (sọc màn hình, nhấp nháy, tối đen).
3. Kiểm tra thông tin kích hoạt bảo hành điện tử thông qua IMEI.
4. Hướng dẫn khách hàng thử khởi động lại máy bằng cách giữ phím Nguồn + Giảm âm lượng trong 10 giây.
5. Nếu vẫn lỗi, tư vấn khách hàng mang máy đến trung tâm bảo hành Samsung gần nhất.
6. Ghi lại kết quả cuộc gọi vào hệ thống.', 1),
(2, 3, 'Quy trình đổi trả sữa bột Vinamilk bị vón cục', '1. Hỏi thăm tình trạng sức khỏe của bé và khách hàng.
2. Ghi nhận thông tin chi tiết: Tên sản phẩm, Lô sản xuất (Lot), Hạn sử dụng (EXP).
3. Hỏi khách hàng về điều kiện bảo quản sữa tại nhà.
4. Thông báo bộ phận kiểm định chất lượng của Vinamilk sẽ liên hệ thu hồi mẫu sữa trong vòng 24 giờ.
5. Hướng dẫn đại lý hoặc siêu thị nơi khách hàng mua tiến hành đổi hộp mới cho khách hàng miễn phí.
6. Cảm ơn khách hàng đã phản hồi đóng góp ý kiến.', 1),
(3, 5, 'Quy trình tiếp nhận sửa chữa Điều hòa Panasonic tại nhà', '1. Chào hỏi theo đúng quy chuẩn Panasonic Care.
2. Ghi nhận lỗi thiết bị (không mát, chảy nước, báo lỗi đèn đỏ).
3. Tra cứu thông tin bảo hành của sản phẩm dựa trên số serial.
4. Xác nhận chi phí: Miễn phí nếu còn trong thời gian bảo hành, Báo giá theo bảng phí hãng nếu ngoài bảo hành.
5. Lên lịch hẹn với kỹ thuật viên khu vực và thông báo thời gian hẹn cụ thể cho khách hàng.
6. Ghi nhận cuộc gọi hoàn tất.', 1),
(4, 4, 'Quy trình kích hoạt dùng thử FPT Cloud Services', '1. Chào khách hàng và hỏi nhu cầu trải nghiệm dịch vụ Cloud (VM, Storage, Database).
2. Hướng dẫn khách hàng truy cập portal portal.fptcloud.com.
3. Hướng dẫn nhập thông tin đăng ký doanh nghiệp và số điện thoại xác thực.
4. Hỗ trợ kích hoạt gói credit dùng thử trị giá $100 sử dụng trong 30 ngày.
5. Gửi tài liệu hướng dẫn sử dụng nhanh qua email khách hàng đăng ký.
6. Đặt lịch cuộc gọi chăm sóc sau 3 ngày.', 1);

-- ============================================================
-- PAYMENTS (11 records)
-- ============================================================
INSERT INTO payments (id, client_id, client_service_id, invoice_no, amount, due_date, paid_date, payment_method, status, notes) VALUES
(1, 1, 1, 'INV-2024-001', '8212500.00', '2024-12-30 17:00:00', '2024-12-27 17:00:00', 'bank_transfer', 'paid', 'Đã gửi nhắc nợ qua email ngày 16/07/2026 11:39'),
(2, 1, 2, 'INV-2024-002', '4927500.00', '2024-12-30 17:00:00', '2024-12-29 17:00:00', 'bank_transfer', 'paid', NULL),
(3, 2, 3, 'INV-2024-003', '17520000.00', '2025-02-27 17:00:00', '2026-07-11 17:00:00', 'bank_transfer', 'paid', NULL),
(4, 2, 4, 'INV-2024-004', '8030000.00', '2025-02-27 17:00:00', '2026-07-14 17:00:00', 'bank_transfer', 'paid', NULL),
(5, 3, 5, 'INV-2024-005', '3240000.00', '2024-11-29 17:00:00', NULL, 'online', 'overdue', 'Đã gửi nhắc nợ qua email ngày 16/07/2026 11:44'),
(6, 4, 6, 'INV-2024-006', '6000000.00', '2024-12-14 17:00:00', '2026-07-11 17:00:00', 'bank_transfer', 'paid', NULL),
(7, 5, 7, 'INV-2024-007', '6570000.00', '2025-08-30 17:00:00', NULL, 'cheque', 'overdue', 'Đã gửi nhắc nợ qua email ngày 16/07/2026 11:40'),
(8, 1, NULL, 'INV-TEST-999', '5000.00', '2026-08-29 17:00:00', NULL, 'bank_transfer', 'pending', NULL),
(9, 3, 14, 'INV-AUTO-988499-4546', '22500.00', '2026-07-15 17:00:00', NULL, 'bank_transfer', 'overdue', 'Hóa đơn tự động cho đăng ký dịch vụ ID: 14'),
(11, 9, NULL, 'INV-2006-TEST', '5600.00', '2000-09-26 17:00:00', NULL, 'bank_transfer', 'overdue', 'Đã gửi nhắc nợ qua email ngày 16/07/2026 14:16'),
(12, 9, 16, 'INV-AUTO-229896-8512', '82500.00', '2026-07-15 17:00:00', NULL, 'bank_transfer', 'overdue', 'Hóa đơn tự động cho đăng ký dịch vụ ID: 16');

-- ============================================================
-- CALL_LOGS (66 records)
-- ============================================================
INSERT INTO call_logs (id, client_id, employee_id, call_type, call_datetime, duration_minutes, purpose, outcome, notes, recording_url, recording_sid) VALUES
(1, 1, 1, 'inbound', '2024-12-01 02:15:00', 12, 'Technical issue with Galaxy S24', 'resolved', NULL, NULL, NULL),
(2, 1, 2, 'inbound', '2024-12-01 03:30:00', 8, 'Order inquiry for TV', 'resolved', NULL, NULL, NULL),
(3, 2, 3, 'outbound', '2024-12-02 07:00:00', 15, 'Customer satisfaction survey', 'completed', NULL, NULL, NULL),
(4, 2, 4, 'telemarketing', '2024-12-02 08:30:00', 20, 'Promotion of new fiber package', 'callback', NULL, NULL, NULL),
(5, 3, 2, 'inbound', '2024-12-03 04:00:00', 5, 'Product availability inquiry', 'resolved', NULL, NULL, NULL),
(6, 4, 4, 'telemarketing', '2024-12-04 02:00:00', 25, 'ERP solution presentation', 'callback', NULL, NULL, NULL),
(7, 5, 1, 'inbound', '2024-12-05 06:45:00', 18, 'AC installation support', 'resolved', NULL, NULL, NULL),
(8, 1, 7, 'outbound', '2024-12-06 03:00:00', 10, 'Follow up on refrigerator complaint', 'resolved', NULL, NULL, NULL),
(9, 2, 3, 'outbound', '2024-12-07 07:30:00', 22, 'Upsell Business Pro package', 'no_answer', NULL, NULL, NULL),
(10, 4, 4, 'telemarketing', '2024-12-08 02:30:00', 30, 'Cloud services demo', 'completed', NULL, NULL, NULL),
(11, 4, 4, 'telemarketing', '2024-12-08 20:00:00', 15, 'Introduce cloud backup', 'completed', NULL, NULL, NULL),
(12, 1, 4, 'inbound', '2021-12-11 09:59:00', 56, 'gdgd', 'resolved', 'dgdfg', NULL, NULL),
(14, 9, 2, 'inbound', '2026-07-11 19:44:00', 0, 'hfhfh', 'callback', 'fhfhf', NULL, NULL),
(15, 10, 15, 'inbound', '2030-01-09 13:56:30', 10, 'Initial setup support', 'resolved', NULL, NULL, NULL),
(16, 1, 1, 'outbound', '2026-07-14 14:16:00', 15, 'Follow up call on installation request', 'completed', NULL, NULL, NULL),
(17, 1, 1, 'outbound', '2026-07-15 21:39:30', 0, 'Nhắc nợ hóa đơn #INV-2024-001', 'completed', 'Hệ thống tự động gửi email nhắc nợ tới: pjh@samsung.vn', NULL, NULL),
(18, 5, 1, 'outbound', '2026-07-15 21:40:20', 0, 'Nhắc nợ hóa đơn #INV-2024-007', 'completed', 'Hệ thống tự động gửi email nhắc nợ tới: yk@panasonic.vn', NULL, NULL),
(19, 3, 1, 'outbound', '2026-07-15 21:44:10', 0, 'Nhắc nợ hóa đơn #INV-2024-005', 'completed', 'Hệ thống tự động gửi email nhắc nợ tới: ltha@vinamilk.vn', NULL, NULL),
(20, 9, 1, 'outbound', '2026-07-16 00:16:27', 0, 'Nhắc nợ hóa đơn #INV-2006-TEST', 'completed', 'Hệ thống tự động gửi email nhắc nợ tới: tuyendzvclluon@gmail.com', NULL, NULL),
(21, NULL, 5, 'outbound', '2026-07-20 02:49:58', 1, 'Cuộc gọi qua hệ thống', 'completed', 'Test luu log thanh cong', NULL, NULL),
(22, NULL, 2, 'inbound', '2026-07-21 21:44:19', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_e9f7b85b06fbcc41d4b70af4cdd1602a | Duration: 1s', NULL, NULL),
(23, NULL, 2, 'inbound', '2026-07-21 21:47:20', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_1dcb66e8f2891d4d5964af8fbee7023c | Duration: 3s', NULL, NULL),
(24, NULL, 2, 'inbound', '2026-07-21 22:02:21', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_af3c7b960ee5464d48e2af0f0ea4075d | Duration: 2s', NULL, NULL),
(25, NULL, 2, 'inbound', '2026-07-21 22:06:10', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_80c30aaddfa7407c1d396228cc6b2a0c | Duration: 1s', NULL, NULL),
(26, NULL, 2, 'outbound', '2026-07-21 22:26:39', 1, 'Cuộc gọi qua hệ thống', 'resolved', 'Hoc tap va trao doi', NULL, NULL),
(27, NULL, 2, 'inbound', '2026-07-21 23:50:36', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_c9a2659c8aff59baddcae59afd08c1f9 | Duration: 2s', NULL, NULL),
(28, NULL, 2, 'inbound', '2026-07-21 23:52:38', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_bc19012d7db9343496843b631fd3d3f9 | Duration: 1s', NULL, NULL),
(29, NULL, 2, 'inbound', '2026-07-21 23:54:41', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_6ca094d348e02fabf3b8c21f67b9dd8e | Duration: 1s', NULL, NULL),
(30, NULL, 2, 'outbound', '2026-07-21 23:54:43', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_6ca094d348e02fabf3b8c21f67b9dd8e', NULL, NULL),
(31, NULL, 1, 'inbound', '2026-07-21 23:54:45', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_fe7e214479939054490877342ac5676b', NULL, NULL),
(32, 1, 1, 'outbound', '2026-07-22 00:02:44', 3, 'Tư vấn kỹ thuật sản phẩm Galaxy S24', 'completed', 'Ghi âm tự động cuộc gọi', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL),
(33, 2, 2, 'inbound', '2026-07-21 23:02:45', 5, 'Hỗ trợ gói cước Viettel Fiber', 'resolved', 'Ghi âm cuộc gọi hỗ trợ', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL),
(34, NULL, 1, 'inbound', '2026-07-22 00:13:29', 1, 'Cuộc gọi đến — client:user_3', 'completed', 'CallSid: CS_225b16ee318b8e25950f90aa068d00e8 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REb62a66494083709c4d585b06ea9e9237.mp3', 'REb62a66494083709c4d585b06ea9e9237'),
(35, NULL, 2, 'inbound', '2026-07-22 00:14:04', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_86fc3922a08dfd955a289d41a4246012 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REea99a92125a761e5e3ad3fe03bc668fe.mp3', 'REea99a92125a761e5e3ad3fe03bc668fe'),
(36, NULL, 2, 'outbound', '2026-07-22 00:14:05', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_86fc3922a08dfd955a289d41a4246012', NULL, NULL),
(37, NULL, 2, 'inbound', '2026-07-22 00:17:03', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_d0abb25c469c4ab0725ceeb86e8b291b | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REbc8bf3457a6a29fdd4254ad93f964a1f.mp3', 'REbc8bf3457a6a29fdd4254ad93f964a1f'),
(38, NULL, 2, 'inbound', '2026-07-22 00:18:52', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_e1615efe1649057a588c0639b64a0c6b | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REfb15a70b8b13197e0f40ef8fbd94c053.mp3', 'REfb15a70b8b13197e0f40ef8fbd94c053'),
(39, NULL, 2, 'outbound', '2026-07-22 00:18:53', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_e1615efe1649057a588c0639b64a0c6b', NULL, NULL),
(40, NULL, 1, 'inbound', '2026-07-22 00:18:55', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_5b6511459dc9c9dd0a928886bbdcfc74', NULL, NULL),
(41, NULL, 2, 'inbound', '2026-07-22 00:22:03', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_1f842b847ca3eda75d41e002edd02041 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE1201aae6b80421958b5df600f39b4636.mp3', 'RE1201aae6b80421958b5df600f39b4636'),
(42, NULL, 1, 'inbound', '2026-07-22 00:22:07', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_099ffa3e78dd10f9483d471dc16b3777', NULL, NULL),
(43, NULL, 2, 'outbound', '2026-07-22 00:22:09', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_1f842b847ca3eda75d41e002edd02041', NULL, NULL),
(44, NULL, 1, 'inbound', '2026-07-22 00:31:51', 1, 'Cuộc gọi đến — client:user_3', 'completed', 'CallSid: CS_bb8752515187151cfd7c2bd6886f37c4 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE075bb117c9fdf8478998f9e976279ecc.mp3', 'RE075bb117c9fdf8478998f9e976279ecc'),
(45, NULL, 1, 'outbound', '2026-07-22 00:31:52', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_bb8752515187151cfd7c2bd6886f37c4', NULL, NULL),
(46, NULL, 2, 'inbound', '2026-07-22 00:35:22', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_4f39ce775a1c882c21e5a0579d4588a2 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REe6dc748f7fa90f139a1a5a474d8cd3e0.mp3', 'REe6dc748f7fa90f139a1a5a474d8cd3e0'),
(47, NULL, 2, 'inbound', '2026-07-22 00:38:56', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_8810eeceee34e39dcc08462ad8cc1ea1 | Duration: 3s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE718c0232757d39b07e051a893a5c082c.mp3', 'RE718c0232757d39b07e051a893a5c082c'),
(48, NULL, 2, 'inbound', '2026-07-22 00:43:47', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_75c6c529aebfed31edd205d049564364 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE2ebd0d85e7c38e0b09b22250e77c8af4.mp3', 'RE2ebd0d85e7c38e0b09b22250e77c8af4'),
(49, NULL, 1, 'inbound', '2026-07-22 00:45:38', 1, 'Cuộc gọi đến — client:user_3', 'completed', 'CallSid: CS_82559c7078adefd420777bb223bfd32b | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE6f72f4b63251dd9954e4b16dea7ec528.mp3', 'RE6f72f4b63251dd9954e4b16dea7ec528'),
(50, NULL, 1, 'outbound', '2026-07-22 00:45:38', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_82559c7078adefd420777bb223bfd32b', NULL, NULL),
(51, NULL, 2, 'inbound', '2026-07-22 00:45:39', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_da0ec4b0681197c6f6a71cd9da7d8eb3', NULL, NULL),
(52, NULL, 2, 'inbound', '2026-07-22 00:54:35', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_c3962725b3ffec54218cd3be1fa3dd40 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE475a4b9927cd63bcde5d92563d3801d6.mp3', 'RE475a4b9927cd63bcde5d92563d3801d6'),
(53, NULL, 2, 'outbound', '2026-07-22 00:54:35', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_c3962725b3ffec54218cd3be1fa3dd40', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE475a4b9927cd63bcde5d92563d3801d6.mp3', 'RE475a4b9927cd63bcde5d92563d3801d6'),
(54, NULL, 1, 'inbound', '2026-07-22 00:54:37', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_2729914d4347417611040609038c5ae6', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE475a4b9927cd63bcde5d92563d3801d6.mp3', 'RE475a4b9927cd63bcde5d92563d3801d6'),
(55, NULL, 2, 'inbound', '2026-07-22 01:03:50', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_59babc221537f0e0a3aff798a9d65d54 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REf4b3d8ae7bf5dfb82b201076d4c920d5.mp3', 'REf4b3d8ae7bf5dfb82b201076d4c920d5'),
(56, NULL, 2, 'outbound', '2026-07-22 01:03:51', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_59babc221537f0e0a3aff798a9d65d54', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REf4b3d8ae7bf5dfb82b201076d4c920d5.mp3', 'REf4b3d8ae7bf5dfb82b201076d4c920d5'),
(57, NULL, 2, 'inbound', '2026-07-22 01:10:15', 1, 'Cuộc gọi đến — client:user_5', 'completed', 'CallSid: CS_2734f3d81389a1f478375f7e591210b0 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REf621dbd4fc8836476d2ecb88f16d7417.mp3', 'REf621dbd4fc8836476d2ecb88f16d7417'),
(58, NULL, 1, 'inbound', '2026-07-22 01:10:15', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_bc82bb9b159b289e7452c1f6796445c2', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REf621dbd4fc8836476d2ecb88f16d7417.mp3', 'REf621dbd4fc8836476d2ecb88f16d7417'),
(59, NULL, 2, 'outbound', '2026-07-22 01:10:17', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_2734f3d81389a1f478375f7e591210b0', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/REf621dbd4fc8836476d2ecb88f16d7417.mp3', 'REf621dbd4fc8836476d2ecb88f16d7417'),
(60, NULL, 1, 'outbound', '2026-07-23 18:57:01', 3, 'Họp nội bộ — Thảo luận dự án ECS', 'completed', 'CallSid: CA_internal_test_1784858221465 | Call between user_3 and user_6', NULL, NULL),
(61, NULL, 1, 'outbound', '2026-07-23 19:12:48', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_57f9a2b09a79a8b8cbe53da1948bafd5', NULL, NULL),
(62, NULL, 1, 'inbound', '2026-07-23 19:18:55', 1, 'Cuộc gọi đến — client:user_3', 'completed', 'CallSid: CS_785040712400c825afa9f219a1663bf5 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE49dc70b5b3f436b06ca3e34a396d63a2.mp3', 'RE49dc70b5b3f436b06ca3e34a396d63a2'),
(63, NULL, 1, 'outbound', '2026-07-23 19:19:12', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_785040712400c825afa9f219a1663bf5', NULL, NULL),
(64, NULL, 2, 'inbound', '2026-07-23 19:19:21', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_a296c9595f192ca47250ed408eb71482', NULL, NULL),
(65, NULL, 1, 'inbound', '2026-07-23 19:21:42', 1, 'Cuộc gọi đến — client:user_3', 'completed', 'CallSid: CS_af38d778a9e60493b7b31e7b93b4d8f8 | Duration: 1s', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE5e694a1f8dbe1a5be717d63aa15a8ada.mp3', 'RE5e694a1f8dbe1a5be717d63aa15a8ada'),
(66, NULL, 2, 'inbound', '2026-07-23 19:21:44', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_bba48afbb8f5358bb2e79ecc4c9a6d97', 'https://api.twilio.com/2010-04-01/Accounts/AC_TWILIO_SID_PLACEHOLDER/Recordings/RE5e694a1f8dbe1a5be717d63aa15a8ada.mp3', 'RE5e694a1f8dbe1a5be717d63aa15a8ada'),
(67, NULL, 1, 'outbound', '2026-07-23 19:21:53', 1, 'Cuộc gọi qua hệ thống', 'completed', 'CallSid: CS_af38d778a9e60493b7b31e7b93b4d8f8', NULL, NULL);

-- ============================================================
-- USERS (14 records)
-- ============================================================
INSERT INTO users (id, username, password_hash, email, full_name, role, employee_id, is_active, last_login) VALUES
(1, 'admin', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'admin@ecs.com', 'System Administrator', 'admin', NULL, 1, '2026-07-24 01:37:29'),
(2, 'manager', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'manager@ecs.com', 'Service Manager', 'manager', NULL, 1, '2026-07-15 04:24:38'),
(3, 'staff1', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'minh.nguyen@ecs.com', 'Nguyen Minh', 'staff', 1, 1, '2026-07-24 02:22:38'),
(4, 'staff_hr', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'staff_hr@ecs.com', 'HR Staff User', 'staff', 5, 1, NULL),
(5, 'staff2', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'lan.tran@ecs.com', 'Tran Lan', 'staff', 2, 1, '2026-07-24 02:17:10'),
(6, 'staff3', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'hung.le@ecs.com', 'Le Hung', 'staff', 3, 1, '2026-07-24 01:57:01'),
(7, 'staff4', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'thu.pham@ecs.com', 'Pham Thu', 'staff', 4, 1, NULL),
(8, 'staff6', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'mai.hoang@ecs.com', 'Hoang Mai', 'staff', 6, 1, NULL),
(9, 'staff7', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'tuan.dang@ecs.com', 'Dang Tuan', 'staff', 7, 1, NULL),
(10, 'staff8', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'hoa.bui@ecs.com', 'Bui Hoa', 'staff', 8, 1, NULL),
(11, 'staff9', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'test.nguyen@ecs.com', 'Nguyen Test', 'staff', 9, 1, NULL),
(12, 'staff10', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'van.an@ecs.com', 'Van An', 'staff', 10, 1, NULL),
(13, 'staff14', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'tuyendzvclluon@gmail.com', 'dfdf dfgdg', 'staff', 14, 1, NULL),
(14, 'staff15', '$2a$10$o7LqzXQi6Vp7rpDJWQOAru.Ink2s5R5en9AbGRI231Sgb.pLlSNXi', 'test_employee@ecs.com', 'Test Employee', 'staff', 15, 1, NULL);

