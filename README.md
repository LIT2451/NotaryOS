# NotaryOS

**Hệ Điều Hành Quản Lý & Số Hóa Quy Trình Văn Phòng Công Chứng Chuyên Nghiệp**

NotaryOS là nền tảng quản lý nghiệp vụ và thống kê tài chính được thiết kế chuyên biệt cho các Văn phòng Công chứng. Dự án giúp giải quyết triệt để các bài toán thủ công trong quản lý số hợp đồng, giảm thiểu sai sót, nâng cao năng suất làm việc của cán bộ và tối ưu hóa tính minh bạch trong quản lý doanh thu văn phòng.

---

## ✨ Tính Năng Nổi Bật

### 1. Số Hóa Quy Trình Nhập Liệu Nghiệp Vụ
* **Form nhập liệu thông minh:** Quản lý thông tin khách hàng, số tiền, ngày công chứng và loại hình dịch vụ trực quan.
* **Đính kèm tài liệu bảo mật:** Hỗ trợ tải lên và quản lý ảnh CCCD/Hộ chiếu (mặt trước và mặt sau) của khách hàng trực tiếp trên hồ sơ để tra cứu khi cần thiết.

### 2. Thuật Toán Kiểm Soát & Tự Động Hóa Số Hợp Đồng (Smart Numbering)
* **Tự động nhảy số thông minh (Max + 1):** Hệ thống tự động tính toán và đề xuất số hợp đồng tiếp theo theo định dạng chuẩn (`CC-YYYY-XXXXXX`, `CT-YYYY-XXXXXX`, `SY-YYYY-ddMM-XXX`), loại bỏ hoàn toàn rủi ro trùng lặp số.
* **Khởi tạo số dễ dàng:** Cho phép thiết lập số khởi đầu của hệ thống thông qua giao diện quản lý nhanh chóng.
* **Tái sử dụng số hợp đồng đã xóa:** Hỗ trợ giữ chỗ sổ trống và nhập đè lại số hợp đồng đã bị xóa mềm, tiết kiệm tối đa tài nguyên lưu trữ và giữ sổ công chứng liền mạch.

### 3. Dashboard Thống Kê & Báo Cáo Doanh Thu Realtime
* **Biểu đồ trực quan:** Dashboard thống kê tổng doanh thu, số lượng hồ sơ theo từng nhóm dịch vụ (Công chứng, Chứng thực, Sao y) thời gian thực.
* **Xuất báo cáo chuyên nghiệp:** Hỗ trợ xuất dữ liệu ra file Excel (`ClosedXML`) và in hóa đơn/báo cáo PDF (`QuestPDF`) chuẩn hóa chỉ với một cú click chuột.

### 4. Phân Quyền Bảo Mật & Nhật Ký Hệ Thống (Audit Logs)
* **Phân quyền vai trò (RBAC):** Định nghĩa chi tiết quyền hạn cho các vai trò **Admin**, **Manager** và **Staff**.
  * *Admin:* Toàn quyền quản lý nhân viên, dịch vụ, xuất báo cáo và cấu hình hệ thống.
  * *Manager:* Quản lý dịch vụ, theo dõi doanh thu và duyệt hồ sơ.
  * *Staff:* Thực hiện tác vụ nghiệp vụ hàng ngày trên hồ sơ cá nhân.
* **Nhật ký kiểm toán (Audit Logs):** Tự động ghi chép chi tiết mọi thao tác nhạy cảm (Tạo mới, Chỉnh sửa thông tin, Xóa hồ sơ) bao gồm: ai thực hiện, thời gian nào, giá trị cũ là gì và giá trị mới thay đổi như thế nào, đảm bảo tính chống chối bỏ.

---

## 🛠️ Kiến Trúc Công Nghệ (Technology Stack)

Hệ thống được xây dựng trên mô hình Client-Server hiện đại, bảo mật và có hiệu năng cao:

* **Frontend (Client App):**
  * **React JS** kết hợp **TypeScript** & **Vite** mang lại tốc độ phản hồi cực nhanh.
  * **Vanilla CSS** & Thiết kế giao diện hiện đại, chuyên nghiệp, tối ưu trải nghiệm người dùng (UX).
  * **Recharts** hỗ trợ hiển thị biểu đồ phân tích dữ liệu trực quan.

* **Backend (Web API Service):**
  * **ASP.NET Core (.NET 8)** cung cấp hiệu năng xử lý API mạnh mẽ, bảo mật cao.
  * **Entity Framework Core** hỗ trợ giao tiếp cơ sở dữ liệu mượt mà, tối ưu câu lệnh SQL.
  * **SignalR Hub** đồng bộ trạng thái số hợp đồng thời gian thực giữa các cán bộ nhập liệu.

* **Cơ sở dữ liệu (Database):**
  * **MySQL Server** lưu trữ dữ liệu an toàn, tin cậy.

---

## 📐 Sơ Đồ Cấu Trúc Dự Án

```text
NotaryOS/
├── NotaryOS.sln             # Giải pháp ứng dụng dotnet tổng thể
├── WebCC.Backend/           # Mã nguồn Backend Web API (C#)
│   ├── Controllers/         # Các API Endpoint nghiệp vụ
│   ├── Data/                # DbContext, Seeder khởi tạo dữ liệu mặc định
│   ├── Models/              # Lớp đối tượng thực thể cơ sở dữ liệu
│   └── Services/            # Dịch vụ xử lý Logic (Audit, Xuất PDF/Excel)
├── WebCC.Backend.Tests/     # Dự án Kiểm thử tự động (Unit Tests)
├── webcc-frontend/          # Mã nguồn ứng dụng giao diện khách (React + Vite)
│   ├── src/components/      # Các thành phần giao diện (Dashboard, Form, Table...)
│   └── src/services/        # Trình gọi API kết nối Backend
└── database_clean_vps.sql   # Script khởi tạo cơ sở dữ liệu gốc sạch cho VPS
```

---

*Phát triển bởi Dương Quang Luận. Bản quyền thuộc về Văn phòng Công chứng Tân Mai.*
