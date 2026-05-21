# WEBCC

Hệ thống quản lý và thống kê công chứng (ASP.NET Core + React + MySQL).

## 1. Yêu cầu môi trường
- .NET SDK 8
- Node.js LTS
- MySQL 8+

## 2. Cấu hình biến môi trường

Backend (`WebCC.Backend`):
- `WEBCC_DB_CONNECTION`: chuỗi kết nối MySQL
- `WEBCC_JWT_TOKEN`: khóa bí mật JWT

Frontend (`webcc-frontend`):
- `VITE_API_BASE_URL`: URL backend, mặc định `http://localhost:5202`

## 3. Khởi tạo database
Chạy file `database.sql` trên MySQL.

## 4. Chạy backend
```bash
cd WebCC.Backend
WEBCC_DB_CONNECTION="Server=localhost;Database=WEBCC_DB;User=root;Password=...;" \
WEBCC_JWT_TOKEN="your-long-secret" \
dotnet run
```

## 5. Chạy frontend
```bash
cd webcc-frontend
cp .env.example .env
npm install
npm run dev
```

## 6. Build
```bash
dotnet build WEBCC.sln
cd webcc-frontend && npm run build
```

## 7. API chính
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/invoices`
- `POST /api/invoices`
- `PUT /api/invoices/{id}`
- `DELETE /api/invoices/{id}`
- `GET /api/invoices/stats`
- `GET /api/invoices/export` (Admin)

## 8. Phân quyền
- Admin: xem/sửa/xóa tất cả hóa đơn + export Excel.
- Staff: chỉ xem/sửa/xóa hóa đơn do chính mình tạo.
