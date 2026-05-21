HƯỚNG DẪN TRIỂN KHAI WEBCC TRÊN WINDOWS VPS (IIS)
==================================================

Cấu trúc thư mục khuyên dùng: C:\NOTA\
- FE: Chứa code Giao diện
- BE: Chứa code API
- database_clean_vps.sql: File nạp Database

BƯỚC 1: CÀI ĐẶT MÔI TRƯỜNG
1. Cài đặt MySQL Server (nếu chưa có).
2. Nạp file 'database_clean_vps.sql' vào MySQL.
3. QUAN TRỌNG: Cài đặt "ASP.NET Core Hosting Bundle" để IIS chạy được Backend.
   Link: https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-aspnetcore-8.0.0-windows-hosting-bundle-installer
4. QUAN TRỌNG: Bật tính năng "WebSocket Protocol" trong Windows Features (IIS -> World Wide Web Services -> Application Development Features -> WebSocket Protocol).

BƯỚC 2: CẤU HÌNH IIS (INTERNET INFORMATION SERVICES)
1. Mở IIS Manager.
2. Tạo một Website mới (ví dụ tên: WEBCC):
   - Physical Path: Trỏ vào thư mục 'C:\NOTA\FE'
   - Port: 80
   - Hostname: congchungtanmai.io.vn (nếu có tên miền)
3. Thêm Virtual Application cho Backend:
   - Chuột phải vào Website 'WEBCC' vừa tạo -> Chọn "Add Application".
   - Alias: Đặt đúng tên là 'api'
   - Physical Path: Trỏ vào thư mục 'C:\NOTA\BE'
   - Nhấn OK.

BƯỚC 3: KIỂM TRA
- Truy cập http://congchungtanmai.io.vn/ -> Sẽ hiện giao diện web.
- Hệ thống sẽ tự động gọi API tại địa chỉ http://congchungtanmai.io.vn/api/

CHÚC BẠN THÀNH CÔNG!
