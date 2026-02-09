# Chi tiết các tính năng - LABGEN TIKTOK (v0.10.0)

Tài liệu này phân tích sâu các tính năng vận hành và kỹ thuật của ứng dụng.

### 1. Quản lý danh tính (Identity Management)
- **Truy xuất đa phương thức:** Hỗ trợ lấy API Token qua việc quét dữ liệu cục bộ từ Streamlabs Desktop hoặc bắt giữ (capture) qua trình duyệt tự động.
- **Lưu trữ đa tài khoản:** Cho phép đăng ký và quản lý danh sách nhiều tài khoản TikTok cùng lúc.
- **Mã hóa AES cao cấp:** Mọi Token được mã hóa bằng Electron `safeStorage` (khóa cấp độ hệ điều hành Windows), đảm bảo an toàn tuyệt đối ngay cả khi file database bị rò rỉ.
- **Xác thực thời gian thực:** Tự động kiểm tra trạng thái quyền hạn Ingest (Approved/Restricted) của từng tài khoản ngay khi nạp hoặc chuyển đổi.

### 2. Cấu hình & Ingest (Stream Optimization)
- **Metadata Management:** Thiết lập Tiêu đề (Title) và Danh mục Live (Category) một cách trực quan.
- **Khớp mã danh mục (Game Mask ID):** Tự động chuẩn hóa tên game và ID tương ứng theo yêu cầu của TikTok, giảm thiểu lỗi khi khởi tạo luồng.
- **Tìm kiếm cục bộ (Local Search):** Kho dữ liệu hàng ngàn game được lưu trữ trong SQLite giúp tìm kiếm gợi ý tức thì, không bị khựng do tốc độ mạng.
- **Ingest Control:** Khởi tạo và thu hồi Endpoint phát sóng (RTMP URL & Stream Key) trực tiếp từ ứng dụng.

### 3. Hệ thống lõi (Kernel & Automation)
- **Smart Initialization:** Quy trình khởi động mượt mà với thanh tiến trình (%), nạp theo thứ tự: *Kernel -> Database -> Dependencies -> Account Persistence*.
- **Auto-driver Bootstrap:** Tự động phát hiện phiên bản trình duyệt Chrome trên máy và tải xuống ChromeDriver tương thích với sự xác nhận của người dùng.
- **Session Persistence:** Ghi nhớ trang cuối cùng đang sử dụng, ngôn ngữ, chế độ hiển thị và tài khoản active ngay lập tức sau mỗi thay đổi.

### 4. UI/UX Chuyên nghiệp
- **Edge-to-Edge Sidebar:** Thanh điều hướng tràn lề hiện đại với hiệu ứng trượt Liquid mượt mà.
- **Dual-Mode Sync:** Hỗ trợ giao diện Sáng/Tối (Light/Dark) với độ tương phản cao, phông chữ **Plus Jakarta Sans** sắc nét.
- **Hệ thống thông báo thông minh:** Sử dụng Toast (Center Top) cho các phản hồi nhanh và AlertBanners cho các thông báo hệ thống quan trọng.
- **System Tray:** Ứng dụng có thể chạy ngầm ở Khay hệ thống, hỗ trợ thu nhỏ khi đóng và menu điều khiển nhanh.

### 5. Chẩn đoán & Giám sát (Diagnostics)
- **Kernel Logs:** Hệ thống nhật ký chi tiết ghi lại mọi sự kiện mạng, truy vấn DB và lỗi hệ thống theo cấp độ (Info, Success, Warn, Error).
- **Diagnostics Dashboard:** Bảng thống kê tổng quan số lượng sự kiện phát sinh giúp người dùng dễ dàng theo dõi sức khỏe ứng dụng.
- **Log Export:** Hỗ trợ xuất dữ liệu nhật ký ra tệp tin `.log` để chẩn đoán chuyên sâu.
