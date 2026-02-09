# Giải thích Mã nguồn Dự án labs-gen-tik (StreamLabs TikTok Stream Key Generator)

Tài liệu này cung cấp cái nhìn chi tiết về cấu trúc và cách hoạt động của ứng dụng `labs-gen-tik`.

## 1. Tổng quan dự án
**labs-gen-tik** là một ứng dụng desktop xây dựng trên nền tảng **Electron**. Mục đích chính là hỗ trợ người dùng lấy **RTMP URL** và **Stream Key** từ Streamlabs để livestream lên TikTok, thông qua việc tương tác với các API không công khai của Streamlabs.

## 2. Cấu trúc thư mục chính
- `src/main/`: Chứa mã nguồn cho **Main Process** (Backend của Electron).
- `src/preload/`: Chứa **Preload Script**, cầu nối bảo mật giữa Main và Renderer.
- `src/renderer.js`: Mã nguồn cho **Renderer Process** (Frontend/Giao diện người dùng).
- `services/`: Chứa các module xử lý nghiệp vụ riêng biệt:
    - `streamlabs.js`: Tương tác với API của Streamlabs.
    - `seleniumToken.js`: Tự động hóa trình duyệt để lấy mã xác thực.
    - `oauth.js`: Xử lý trao đổi mã (code) lấy Token qua giao thức OAuth PKCE.
    - `tokenService.js`: Tìm và đọc Token từ ứng dụng Streamlabs Desktop đã cài đặt trên máy.

## 3. Kiến trúc Electron
Ứng dụng sử dụng mô hình đa tiến trình của Electron:
- **Main Process (`src/main/index.js`)**: Quản lý vòng đời ứng dụng, tạo cửa sổ giao diện, và lắng nghe các sự kiện IPC (Inter-Process Communication) từ frontend. Nó có quyền truy cập đầy đủ vào Node.js và hệ thống.
- **Preload Script (`src/preload/index.js`)**: Sử dụng `contextBridge` để lộ ra một đối tượng `window.api` cho frontend. Điều này cho phép frontend gọi các hàm backend một cách an toàn mà không cần quyền truy cập trực tiếp vào Node.js.
- **Renderer Process (`src/renderer.js`)**: Chạy trong môi trường trình duyệt, xử lý DOM, sự kiện người dùng và gửi yêu cầu tới Main Process thông qua `window.api`.

## 4. Các dịch vụ quan trọng

### Xác thực (Authentication)
Ứng dụng hỗ trợ hai phương thức để có được `access_token` của Streamlabs:
1.  **Online (Selenium)**: 
    - Khởi tạo trình duyệt Chrome thông qua `selenium-webdriver`.
    - Điều hướng người dùng đến trang đăng nhập Streamlabs.
    - Theo dõi URL để bắt lấy mã `code` sau khi đăng nhập thành công.
    - Dùng `oauth.js` để đổi `code` lấy `access_token` theo chuẩn PKCE.
2.  **Offline (Local Token)**:
    - Tìm kiếm thư mục dữ liệu của ứng dụng **Streamlabs Desktop** (thường trong `%AppData%` trên Windows).
    - Truy cập vào cơ sở dữ liệu LevelDB của nó để trích xuất token người dùng đã đăng nhập trước đó.

### Tương tác API Streamlabs (`services/streamlabs.js`)
Đây là trái tim của ứng dụng. Nó định nghĩa class `StreamService` để:
- Gửi các request HTTP đến API của Streamlabs (ví dụ: `https://streamlabs.com/api/v5/...`).
- Hàm `start()`: Gửi yêu cầu bắt đầu stream để lấy về thông tin RTMP (URL và Key) cho TikTok.
- Các hàm khác như `getInfo()` và `end()` để quản lý trạng thái phiên stream.

## 5. Luồng hoạt động chính
1.  **Khởi động**: Main Process tạo cửa sổ và nạp giao diện.
2.  **Lấy Token**: Người dùng chọn lấy token online (qua trình duyệt) hoặc offline (từ máy tính).
3.  **Yêu cầu Key**: Khi có token, Renderer gửi yêu cầu `startStream` tới Main.
4.  **Gọi API**: Main gọi `StreamService.start(token)`, nhận về RTMP URL và Stream Key.
5.  **Hiển thị**: Kết quả được gửi ngược lại Renderer để hiển thị cho người dùng copy.

---
Tài liệu này được tạo tự động bởi Gemini CLI để hỗ trợ việc hiểu mã nguồn.
