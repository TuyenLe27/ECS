# ⚡ Excell-On Services (ECS) - Hệ Thống Quản Lý Dịch Vụ Khách Hàng

Dự án Hệ thống Quản lý Dịch vụ Khách hàng (ECS Consulting Management Portal) là giải pháp Web App toàn diện giúp quản lý các phòng ban, nhân sự phụ trách dịch vụ, thông tin khách hàng, đăng ký dịch vụ, sản phẩm khách hàng, tính toán hóa đơn và quản lý cuộc gọi/nhật ký làm việc.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Frontend**: React (Vite), TailwindCSS/Vanilla CSS, Lucide Icons, Recharts (Biểu đồ), Axios.
- **Backend**: Node.js, Express.js, JWT (Xác thực bảo mật), ExcelJS (Xuất báo cáo Excel), Puppeteer-core (Xuất báo cáo PDF chất lượng cao).
- **Database**: MySQL 8.0 với Sequelize ORM.
- **Containerization**: Docker & Docker Compose.

---

## 🔐 Tài Khoản Đăng Nhập Mẫu
| Tài Khoản | Mật Khẩu | Vai Trò (Role) | Quyền Hạn |
|---|---|---|---|
| `admin` | `Admin@123` | **Admin** | Toàn quyền cấu hình, CRUD, Xem doanh thu |
| `manager` | `Admin@123` | **Manager** | Quản lý khách hàng, duyệt báo cáo |
| `staff1` | `Admin@123` | **Staff** | Nhập liệu cuộc gọi, xem thông tin được phân công |

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Dự Án (Sau Khi Git Clone)

### 📌 Yêu Cầu Hệ Thống (Prerequisites)
Hãy đảm bảo bạn đã cài đặt các công cụ sau:
1. **Node.js** (Phiên bản >= v18.0)
2. **MySQL Server** (Phiên bản >= 8.0) hoặc **Docker Desktop**

---

### 📥 Bước 1: Clone mã nguồn dự án
```bash
git clone https://github.com/TuyenLe27/ECS.git
cd ECS
```

---

### 💻 Cách Chạy 1: Chạy Local (Không Dùng Docker)

#### 1. Cấu hình Cơ sở dữ liệu MySQL
1. Khởi động MySQL local trên máy của bạn (Port mặc định: `3306`).
2. Mở terminal MySQL hoặc MySQL Workbench, chạy câu lệnh sau để tạo và import database mẫu:
   ```bash
   # Đăng nhập vào MySQL và import cấu trúc database (schema)
   mysql -u root -p12345678 -e "CREATE DATABASE IF NOT EXISTS ecs_db;"
   mysql -u root -p12345678 ecs_db < database/schema.sql

   # Import dữ liệu mẫu (seed data)
   mysql -u root -p12345678 ecs_db < database/seed.sql
   ```
   *(Lưu ý: Thay đổi `root` và `12345678` bằng username và password MySQL thực tế của bạn).*

#### 2. Cấu hình Environment Variables (Biến môi trường)
1. **Backend**:
   - Sao chép file `backend/.env.example` thành `backend/.env`:
     ```bash
     cp backend/.env.example backend/.env
     ```
   - Mở file `backend/.env` và cập nhật thông tin kết nối DB của bạn (`DB_PASSWORD`, `DB_USER`, `DB_HOST`).
2. **Frontend**:
   - Sao chép file `frontend/.env.example` thành `frontend/.env`:
     ```bash
     cp frontend/.env.example frontend/.env
     ```

#### 3. Chạy Backend API
```bash
cd backend
npm install
npm run dev # Hoặc node server.js
```
- API sẽ chạy tại: **`http://localhost:5000`**

#### 4. Chạy Frontend Application
Mở một terminal mới song song:
```bash
cd frontend
npm install
npm run dev
```
- Ứng dụng Web sẽ chạy tại: **`http://localhost:5173`** (Đăng nhập với tài khoản `admin` / `Admin@123`).

---

### 🐳 Cách Chạy 2: Chạy Bằng Docker (Một câu lệnh duy nhất - Khuyên dùng)

Nếu máy tính của bạn đã cài đặt **Docker** và **Docker Desktop**, bạn có thể khởi chạy toàn bộ hệ thống (gồm cả MySQL Database, Backend API, và Frontend Nginx) chỉ với một câu lệnh:

```bash
# Đứng tại thư mục gốc của dự án (ECS) và chạy:
docker compose up --build
```

Sau khi Docker khởi chạy xong:
- **Frontend App**: Truy cập tại **`http://localhost:3000`**
- **Backend API**: Truy cập tại **`http://localhost:5000`**
- **MySQL Container (ecs_mysql)**: Lắng nghe tại port `3307` của host machine (để tránh xung đột với MySQL 3306 đang chạy trên máy của bạn nếu có). Database bên trong container tự động được import schema và seed data từ trước.

*Lưu ý: Khi tắt máy (Shutdown), các container sẽ tự động dừng. Lần tới khi bật máy, bạn chỉ cần mở ứng dụng **Docker Desktop** lên và nhấn nút **Start/Play** ở nhóm container `ecs` để chạy lại mà không cần gõ lệnh.*

---

### 🌐 Cách Chạy 3: Chạy trực tiếp từ Docker Hub (Không cần tải mã nguồn)

Nếu bạn chỉ muốn chạy thử ứng dụng trên máy mới mà không cần cài Git hay tải mã nguồn (chỉ cần chạy ứng dụng):
1. Tải duy nhất file `docker-compose-hub.yml` và thư mục `database/` chứa dữ liệu mẫu về máy mới.
2. Chạy lệnh:
   ```bash
   docker compose -f docker-compose-hub.yml up
   ```
   *Hệ thống tự động kéo các bản đóng gói (Images) đã được lưu trên Docker Hub của bạn (`tuyenlv372/ecs-backend` và `tuyenlv372/ecs-frontend`) về chạy lập tức.*

---

## 🔄 Quy Trình Code Trên Nhiều Máy Tính (Đồng bộ bằng Git)

Khi bạn muốn code dự án này trên 2 máy tính khác nhau (ví dụ: máy A ở nhà và máy B ở trường), hãy làm theo quy trình chuẩn sau:

### 1. Khi kết thúc phiên code ở máy B:
Sau khi sửa đổi mã nguồn hoặc thêm tính năng mới ở máy B, bạn gõ các lệnh sau ở terminal để lưu và đẩy code mới lên GitHub:
```bash
git add .
git commit -m "Nội dung/tính năng bạn vừa sửa đổi"
git push origin main
```

### 2. Khi quay lại máy A (hoặc máy khác):
Trước khi bắt đầu code tiếp trên máy A, bạn mở thư mục dự án và chạy lệnh sau để cập nhật code mới nhất từ GitHub về máy:
```bash
git pull origin main
```
*Lúc này máy A sẽ tự động tải các phần sửa đổi ở máy B về và bạn có thể chạy hoặc code tiếp bình thường!*

---

## 📊 Biểu Phí Dịch Vụ Mẫu
- **In-bound**: $4,500 / ngày / nhân viên
- **Out-bound**: $6,000 / ngày / nhân viên
- **Tele Marketing**: $5,500 / ngày / nhân viên
*(Biểu phí và doanh thu được tự động tính toán chính xác theo đơn vị Đô la Mỹ $)*

