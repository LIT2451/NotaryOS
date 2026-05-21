# Workflow Phát Triển Hệ Thống Quản Lý & Thống Kê Công Chứng (ASP.NET Core + React + MySQL)

Tài liệu này hướng dẫn quy trình xây dựng ứng dụng quản lý số hóa đơn và báo cáo doanh thu công chứng.

## 1. Chuẩn Bị Môi Trường
- **IDE:** Visual Studio 2022 / VS Code.
- **Runtime:** .NET 8 SDK, Node.js (LTS).
- **Database:** MySQL.

---

## 2. Thiết Kế Luồng Nghiệp Vụ (Business Flow)
1. **Tiếp nhận:** Cán bộ mở Form nhập liệu mới.
2. **Xác thực:** Hệ thống kiểm tra "Số hóa đơn" đã tồn tại chưa để tránh nhập trùng.
3. **Ghi nhận:** Lưu thông tin hóa đơn kèm dấu thời gian (Timestamp) và ID người nhập.
4. **Xử lý số liệu:** Backend tính toán các chỉ số (Tổng tiền, Số lượng hóa đơn theo loại).
5. **Trình diễn:** Frontend hiển thị biểu đồ Dashboard và danh sách bộ lọc.

---

## 3. Thiết Kế Phân Quyền (Authorization)
Hệ thống phân chia theo vai trò (Role-based Access Control):
- **Admin:**
  - Toàn quyền CRUD (Thêm, Đọc, Sửa, Xóa) trên mọi dữ liệu.
  - Xem biểu đồ tổng hợp của toàn bộ văn phòng.
  - Quản lý danh sách nhân viên.
- **Staff (Cán bộ):**
  - Chỉ CRUD hóa đơn do chính mình tạo ra.
  - Xem báo cáo năng suất cá nhân.
  - Không có quyền xóa hóa đơn sau khi đã chốt sổ ngày.

---

## 4. Thiết Kế Cơ Sở Dữ Liệu (MySQL) - Cập Nhật
Tạo các bảng chính để quản lý nghiệp vụ:
- `Roles`: `Id`, `RoleName` (Admin, Staff).
- `Users`: `Id`, `Username`, `PasswordHash`, `FullName`, `RoleId` (FK).
- `Invoices`:
    - `Id` (PK), `InvoiceNumber`, `Amount`, `ServiceTypeId` (FK), `NotaryDate`, `CreatedBy` (FK to Users), `UpdatedAt`.
- `ServiceTypes`: `Id`, `TypeName` (Mua bán, Thế chấp, Di chúc...).

**Câu lệnh gợi ý:**
```sql
CREATE TABLE Invoices (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    InvoiceNumber VARCHAR(50) NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    ServiceType VARCHAR(100),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UserId INT
);
```

---

## 3. Phát Triển Backend (C# - Web API) - Nâng Cấp
1. **Dịch vụ báo cáo (Reporting Service):**
   - Viết các truy vấn LINQ để thống kê:
     - Tổng doanh thu theo ngày/tháng/năm.
     - Số lượng hóa đơn theo từng loại dịch vụ.
     - Hiệu suất làm việc của từng cán bộ.
2. **Xử lý số liệu tài chính:** Đảm bảo sử dụng kiểu dữ liệu `decimal` để tránh sai số tiền tệ.
3. **Phân quyền:** Chỉ Admin mới được xem báo cáo tổng quát, User thường chỉ thấy dữ liệu cá nhân.

---

## 4. Phát Triển Frontend (React + TS) - Chuyên Sâu
1. **Form Nhập Liệu (Input):**
   - Sử dụng `react-hook-form` để validate số hóa đơn và số tiền.
   - Thêm tính năng tự động gợi ý (Autocomplete) cho tên dịch vụ.
2. **Báo Cáo & Thống Kê (Dashboard):**
   - Thư viện biểu đồ: `Recharts` hoặc `Chart.js`.
   - Các loại biểu đồ cần có:
     - Biểu đồ đường (Line Chart): Xu hướng doanh thu theo thời gian.
     - Biểu đồ tròn (Pie Chart): Tỷ trọng các loại hóa đơn công chứng.
3. **Quản lý danh sách:**
   - Sử dụng `TanStack Table` (React Table) để hiển thị danh sách hóa đơn, hỗ trợ lọc theo ngày và tìm kiếm theo số hóa đơn.

---

## 5. Hướng Đi & Gợi Ý Tính Năng (Mới)
Để hệ thống chuyên nghiệp hơn, bạn nên đi theo lộ trình sau:
- **Giai đoạn 1:** Xây dựng tính năng CRUD (Thêm, Xóa, Sửa) hóa đơn cơ bản.
- **Giai đoạn 2:** Xây dựng màn hình Dashboard tổng hợp dữ liệu thời gian thực.
- **Giai đoạn 3:** Xuất báo cáo (Export): Tính năng xuất file Excel/PDF cho các báo cáo doanh thu hàng tháng.
- **Giai đoạn 4:** Bảo mật: Thêm Log để theo dõi ai đã sửa đổi số tiền trên hóa đơn để tránh gian lận.

---

## 6. Kết Nối & Kiểm Thử
1. Kiểm tra logic tính tổng tiền trên API trước khi hiển thị lên biểu đồ.
2. Đảm bảo UI hiển thị tốt trên cả máy tính bảng (cho cán bộ kiểm tra nhanh).

---

## 7. Triển Khai (Deployment) - Không dùng Docker
- **Backend:** 
  - Publish bằng lệnh `dotnet publish -c Release`.
  - Host trên **IIS (Internet Information Services)** hoặc chạy như một **Windows Service**.
- **Frontend:** 
  - Build file tĩnh bằng `npm run build`.
  - Copy thư mục `build/` (hoặc `dist/`) vào thư mục web của IIS hoặc host qua Nginx trên Windows/Linux.
- **Database:** 
  - Cài đặt MySQL Server trực tiếp trên máy chủ.
  - Cấu hình chuỗi kết nối (Connection String) trong `appsettings.json` trỏ về địa chỉ IP của máy chủ DB.
