# ⚡ Excell-On Services (ECS) - Hệ Thống Quản Lý Dịch Vụ Khách Hàng

Dự án Hệ thống Quản lý Dịch vụ Khách hàng (ECS Consulting Management Portal) là giải pháp Web App toàn diện giúp quản lý các phòng ban, nhân sự phụ trách dịch vụ, thông tin khách hàng, đăng ký dịch vụ, sản phẩm khách hàng, tính toán hóa đơn và quản lý cuộc gọi/nhật ký làm việc.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Frontend**: React (Vite), TailwindCSS/Vanilla CSS, Lucide Icons, Recharts (Biểu đồ), Axios, @twilio/voice-sdk.
- **Backend**: Node.js, Express.js, JWT (Xác thực bảo mật), ExcelJS (Xuất báo cáo Excel), Puppeteer-core (Xuất báo cáo PDF), Twilio (Gọi điện thoại thật).
- **Database**: MySQL 8.0 với Sequelize ORM.
- **Containerization**: Docker & Docker Compose.
- **Telephony**: Twilio Voice SDK — gọi đi/nhận cuộc gọi đến trực tiếp trên trình duyệt, tự động tạo CallLog.

---

## 📞 Tính Năng Gọi Điện (Twilio Voice)

### Tổng Quan
Nhân viên có thể **gọi ra số điện thoại thật** và **nhận cuộc gọi đến** ngay trên trình duyệt — không cần phần mềm điện thoại riêng. Mỗi cuộc gọi kết thúc sẽ **tự động tạo CallLog** với thời lượng thực tế.

### Thông Tin Twilio (đã cấu hình)
| Tham số | Giá trị |
|---|---|
| Account SID | `YOUR_TWILIO_ACCOUNT_SID` |
| Phone Number | `+18573926288` |
| TwiML App SID | `YOUR_TWILIO_TWIML_APP_SID` |
| API Key | `YOUR_TWILIO_API_KEY` |

> ⚠️ **Bảo mật:** Auth Token và API Secret lưu trong `backend/.env`, **không commit lên GitHub**.

### Biến Môi Trường Twilio (trong `backend/.env`)
```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+18573926288
TWILIO_TWIML_APP_SID=YOUR_TWILIO_TWIML_APP_SID
TWILIO_API_KEY=YOUR_TWILIO_API_KEY
TWILIO_API_SECRET=YOUR_TWILIO_API_SECRET
```

### Cài Đặt Để Chạy Twilio (Development)

Twilio cần URL công khai để gửi webhook về backend. Dùng **localtunnel** (đã cài sẵn):

**Terminal riêng — chạy trước khi khởi động backend:**
```bash
lt --port 5000 --subdomain ecs-backend-twilio
# → URL: https://ecs-backend-twilio.loca.lt
```

> 💡 Giữ terminal này chạy suốt phiên làm việc. Mỗi lần mở lại máy phải chạy lại lệnh này.

### Cấu Hình Twilio Console (đã thiết lập — chỉ cần cập nhật nếu đổi URL)

**TwiML App** → [console.twilio.com > Voice > TwiML Apps](https://console.twilio.com/us1/develop/voice/twiml/apps) > `ECS Voice App`:
- Voice Request URL: `https://ecs-backend-twilio.loca.lt/api/twilio/voice`

**Phone Number** → [console.twilio.com > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming) > `+18573926288` > Configure:
- A Call Comes In: `https://ecs-backend-twilio.loca.lt/api/twilio/incoming`
- Call Status Changes: `https://ecs-backend-twilio.loca.lt/api/twilio/status`

### Các Webhook Endpoint Backend
| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/twilio/token` | GET | Tạo Access Token cho browser SDK (cần JWT) |
| `/api/twilio/voice` | POST | TwiML cho cuộc gọi ra (Twilio gọi vào) |
| `/api/twilio/incoming` | POST | TwiML cho cuộc gọi đến từ ngoài |
| `/api/twilio/status` | POST | StatusCallback — tự tạo CallLog khi call kết thúc |
| `/api/twilio/log` | POST | Fallback tạo CallLog từ frontend (cần JWT) |

### Cách Test Tính Năng
1. Chạy `lt --port 5000 --subdomain ecs-backend-twilio` (terminal riêng)
2. Chạy backend: `cd backend && npm run dev`
3. Chạy frontend: `cd frontend && npm run dev`
4. Đăng nhập → thấy widget **"Sẵn sàng nhận cuộc gọi"** góc phải màn hình (chấm xanh)
5. **Test gọi ra:** Bấm "Gọi Ra" → nhập số → gọi → số điện thoại đích sẽ reo
6. **Test nhận cuộc gọi:** Gọi từ điện thoại vào số `+18573926288` → widget reo → bấm Nghe
7. Sau cuộc gọi → popup điền kết quả → CallLog tự động xuất hiện trong danh sách



---

## 🔐 Tài Khoản Đăng Nhập Mẫu (Mật khẩu mặc định: `Admin@123`)
| Tài Khoản | Mật Khẩu | Vai Trò (Role) | Nhân Viên Liên Kết |
|---|---|---|---|
| `admin` | `Admin@123` | **Admin** | Quản trị viên hệ thống |
| `manager` | `Admin@123` | **Manager** | Quản lý dịch vụ |
| `staff1` | `Admin@123` | **Staff** | Nguyễn Minh (`EMP001` - Call Center Agent) |
| `staff2` | `Admin@123` | **Staff** | Trần Lần (`EMP002` - Senior Agent) |
| `staff3` | `Admin@123` | **Staff** | Lê Hùng (`EMP003` - Outbound Specialist) |
| `staff4` | `Admin@123` | **Staff** | Phạm Thu (`EMP004` - Tele Marketer) |
| `staff5` | `Admin@123` | **Staff** | Võ Đức (`EMP005` - HR Officer) |
| `staff6` | `Admin@123` | **Staff** | Hoàng Mai (`EMP006` - IT Technician) |
| `staff7` | `Admin@123` | **Staff** | Đặng Tuấn (`EMP007` - Team Leader) |
| `staff8` | `Admin@123` | **Staff** | Bùi Hoa (`EMP008` - Training Coordinator) |

---

## 📥 Bước 1: Clone mã nguồn dự án

```bash
git clone https://github.com/TuyenLe27/ECS.git
cd ECS
```

---

## 🚀 Cách Chạy Dự Án

### 🐳 Cách 1: Chạy Bằng Docker (Khuyên dùng – Một lệnh duy nhất)

> Phù hợp khi muốn **chạy nhanh** mà không cần cài Node.js hay MySQL riêng.

**Yêu cầu:** Chỉ cần cài **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**

```bash
# Đứng tại thư mục gốc của dự án (ECS) và chạy:
docker compose up -d --build
```

Sau khi Docker khởi chạy xong:
- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL**: port `3307` (tránh xung đột với MySQL local)

> 💡 **Lần sau:** Chỉ cần mở **Docker Desktop** → nhấn nút **Play ▶** vào nhóm container `esc` là xong, không cần gõ lệnh lại.

---

### 💻 Cách 2: Chạy Local (Để Code & Phát Triển)

> Phù hợp khi muốn **sửa code** và thấy kết quả thay đổi ngay lập tức (Hot Reload).

**Yêu cầu:**
- [Node.js](https://nodejs.org) >= v18.0
- MySQL Server >= 8.0 **hoặc** Docker Desktop (để chạy riêng MySQL)

#### Bước 1: Tạo Database

**Option A – Dùng Docker chỉ cho MySQL (tiện nhất, không cần cài MySQL):**
```bash
# Chạy lệnh này từ thư mục gốc của dự án
docker run -d --name ecs_mysql_local ^
  -e MYSQL_ROOT_PASSWORD=YOUR_MYSQL_PASSWORD ^
  -e MYSQL_DATABASE=ecs_db ^
  -p 3306:3306 ^
  -v "%cd%/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql" ^
  -v "%cd%/database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql" ^
  mysql:8.0
```
*(Mac/Linux thay `^` bằng `\` và `%cd%` bằng `$(pwd)`)*

**Option B – Dùng MySQL đã cài sẵn trên máy:**
```bash
mysql -u YOUR_USER -pYOUR_PASSWORD -e "CREATE DATABASE IF NOT EXISTS ecs_db;"
mysql -u YOUR_USER -pYOUR_PASSWORD ecs_db < database/schema.sql
mysql -u YOUR_USER -pYOUR_PASSWORD ecs_db < database/seed.sql
```
*(Thay `YOUR_USER` và `YOUR_PASSWORD` bằng thông tin MySQL thực tế của bạn)*

#### Bước 2: Cấu hình Backend
```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux

npm install
```

Mở file `backend/.env`, kiểm tra thông tin:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecs_db
DB_USER=YOUR_MYSQL_USER
DB_PASSWORD=YOUR_MYSQL_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET_KEY
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

#### Bước 3: Cấu hình Frontend
```bash
cd frontend
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux

npm install
```

File `frontend/.env` nên có:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Bước 4: Chạy song song 2 terminal

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
# ✅ API chạy tại http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
# ✅ Web chạy tại http://localhost:5173
```

---

### 🌐 Cách 3: Chạy Từ Docker Hub (Không cần tải mã nguồn)

> Phù hợp khi chỉ muốn **chạy thử app** mà không cần clone code.

1. Tải duy nhất file `docker-compose-hub.yml` và thư mục `database/` về máy mới.
2. Chạy lệnh:
```bash
docker compose -f docker-compose-hub.yml up -d
```
*Hệ thống tự động kéo images từ Docker Hub (`YOUR_DOCKERHUB_USERNAME/ecs-backend` và `YOUR_DOCKERHUB_USERNAME/ecs-frontend`) về và chạy luôn.*

---

## 📊 Biểu Phí Dịch Vụ Mẫu
- **In-bound**: $4,500 / ngày / nhân viên
- **Out-bound**: $6,000 / ngày / nhân viên
- **Tele Marketing**: $5,500 / ngày / nhân viên

---

## 🔄 Quy Trình Làm Việc Nhóm / Nhiều Máy

### 1️⃣ Khi kết thúc phiên code → Push lên GitHub

```bash
# Xem những file nào đã thay đổi
git status

# Thêm tất cả thay đổi vào staging
git add .

# Commit với nội dung mô tả rõ ràng
git commit -m "feat: mô tả tính năng bạn vừa làm"

# Push lên GitHub
git push origin main
```

> ⚠️ **Quan trọng:** Nếu bạn **thêm/sửa dữ liệu qua giao diện** (thêm client, employee...), hãy cập nhật file `database/seed.sql` rồi commit kèm theo để máy khác có dữ liệu mới nhất.

---

### 2️⃣ Khi bắt đầu code ở máy khác → Pull code mới về

```bash
# Cập nhật code mới nhất từ GitHub về máy
git pull origin main
```

> Nếu có conflict (xung đột code), Git sẽ báo và bạn cần giải quyết thủ công trước khi tiếp tục.

---

### 3️⃣ Sau khi thay đổi code → Build & Push lên Docker Hub

> Thực hiện bước này khi muốn **cập nhật Docker images** để người khác có thể dùng Cách 3 (Docker Hub) với code mới nhất.

#### a. Đăng nhập Docker Hub (chỉ cần làm 1 lần)
```bash
docker login
# Nhập Docker Hub username và password của bạn
```

#### b. Build images mới từ code hiện tại
```bash
# Build backend image
docker build -t YOUR_DOCKERHUB_USERNAME/ecs-backend:latest ./backend

# Build frontend image
docker build -t YOUR_DOCKERHUB_USERNAME/ecs-frontend:latest ./frontend
```

#### c. Push images lên Docker Hub
```bash
docker push YOUR_DOCKERHUB_USERNAME/ecs-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/ecs-frontend:latest
```

#### d. Khởi động lại hệ thống với code mới (Bảo toàn dữ liệu Database)
```bash
docker compose down          # Dừng container (KHÔNG dùng -v)
docker compose up -d --build # Rebuild code mới và khởi chạy
```

> ⚠️ **LƯU Ý QUAN TRỌNG VỀ DATABASE:**
> - **KHÔNG dùng `docker compose down -v`**: Thêm tham số `-v` sẽ xóa sạch toàn bộ ổ đĩa lưu trữ (volume) của MySQL và **làm mất tất cả dữ liệu thực tế** bạn đã thêm/sửa qua giao diện web!
> - Cả môi trường **Local Dev (`npm run dev`)** và **Docker** đều dùng chung Database MySQL (port `3307`), dữ liệu tạo ra ở đâu cũng sẽ tự động lưu vĩnh viễn và đồng bộ 100%.

---

### ✅ Tóm Tắt Quy Trình Cập Nhật Code Hoàn Chỉnh

```bash
# 1. Commit và push code mới lên GitHub
git add .
git commit -m "feat: mô tả thay đổi"
git push origin main

# 2. Build lại và khởi chạy Docker với code mới (Giữ nguyên dữ liệu DB)
docker compose down
docker compose up -d --build

# 3. (Tùy chọn) Push images lên Docker Hub nếu muốn share cho người khác
docker build -t YOUR_DOCKERHUB_USERNAME/ecs-backend:latest ./backend
docker build -t YOUR_DOCKERHUB_USERNAME/ecs-frontend:latest ./frontend
docker push YOUR_DOCKERHUB_USERNAME/ecs-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/ecs-frontend:latest
```

---

## 🗂️ Cấu Trúc Thư Mục Dự Án

```
ECS/
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Xử lý logic nghiệp vụ
│   │   ├── models/         # Sequelize ORM models
│   │   ├── routes/         # Định nghĩa API routes
│   │   └── middleware/     # Auth, validation middleware
│   ├── server.js           # Entry point
│   ├── .env.example        # Template biến môi trường
│   └── Dockerfile
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Các trang chính
│   │   ├── services/       # Axios API calls
│   │   └── context/        # React Context (Auth...)
│   ├── .env.example        # Template biến môi trường
│   └── Dockerfile
│
├── database/
│   ├── schema.sql          # Cấu trúc bảng (DDL)
│   └── seed.sql            # Dữ liệu mẫu (DML)
│
├── docker-compose.yml      # Chạy local bằng Docker (build từ source)
└── docker-compose-hub.yml  # Chạy từ Docker Hub images
```
