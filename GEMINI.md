# GEMINI.md - Tài liệu Dự án labs-gen-tik

Tài liệu này cung cấp thông tin chi tiết về cấu trúc, công nghệ và quy trình hoạt động của ứng dụng `labs-gen-tik`.

## 1. Tổng quan
**labs-gen-tik** là ứng dụng desktop (Electron) giúp người dùng lấy **RTMP URL** và **Stream Key** từ Streamlabs để livestream lên TikTok. Ứng dụng này đã được viết lại hoàn toàn để tối ưu hóa hiệu năng và trải nghiệm người dùng.

## 2. Công nghệ sử dụng
- **Cốt lõi:** Electron (v30+)
- **Build Tool:** electron-vite
- **Frontend:** React 19, Tailwind CSS, Framer Motion (cho hiệu ứng UI)
- **Tự động hóa:** Selenium WebDriver (để lấy Token qua trình duyệt)
- **Tiện ích:** Lucide React (Icons), SemVer (Quản lý phiên bản)

## 3. Cấu trúc thư mục (Cập nhật)

### Backend & Logic (Main Process & Services)
- `src/main/`: Quản lý vòng đời Electron, cửa sổ ứng dụng và IPC Handlers.
- `services/`: Chứa toàn bộ logic nghiệp vụ (Business Logic):
    - `streamlabs.js`: Tương tác trực tiếp với API v5 của Streamlabs để lấy key TikTok.
    - `tokenService.js`: Tìm và trích xuất token từ bản cài đặt **Streamlabs Desktop** cục bộ.
    - `seleniumToken.js` & `oauth.js`: Xử lý đăng nhập TikTok qua Selenium và trao đổi mã OAuth PKCE.
    - `configService.js`: Lưu trữ và quản lý cấu hình người dùng cục bộ.
    - `updateService.js`: Kiểm tra phiên bản mới từ GitHub.

### Bridge (Preload Script)
- `src/preload/`: Sử dụng `contextBridge` để phơi bày các API bảo mật (`window.api`) từ backend cho frontend.

### Frontend (Renderer Process)
- `src/`: Sử dụng React với kiến trúc hiện đại:
    - `App.jsx`: Root component quản lý Layout và Routing.
    - `pages/`: Chứa các trang chính (Dashboard, TokenVault, LiveSetup, Console, Pulse).
    - `components/`: UI components dùng chung (Sidebar, Layout, UI Elements).
    - `hooks/`, `store/`, `utils/`: Các logic phụ trợ cho frontend.

## 4. Quy trình hoạt động chính

1. **Lấy mã xác thực (Authentication):**
    - **Cách 1 (Local):** Ứng dụng quét các file log của Streamlabs Desktop trong `%AppData%` để tìm `apiToken`.
    - **Cách 2 (Web):** Khởi động trình duyệt Selenium, người dùng đăng nhập TikTok, ứng dụng bắt mã `code` và đổi lấy token.
2. **Cấu hình Live:** Người dùng chọn danh mục (game), tiêu đề và các thiết lập khác.
3. **Lấy Key:** Gửi yêu cầu `startStream` tới Streamlabs API. Kết quả trả về gồm `stream_url` và `stream_key`.
4. **Cập nhật:** Ứng dụng tự động kiểm tra phiên bản mới qua `electron-updater` khi khởi động.

## 5. Quy tắc phát triển (Versioning)
Dự án tuân thủ nghiêm ngặt **Semantic Versioning (SemVer)**:
- **PATCH**: Sửa lỗi.
- **MINOR**: Tính năng mới.
- **MAJOR**: Thay đổi lớn, phá vỡ tính tương thích.

Sử dụng lệnh `npm version <patch|minor|major>` để cập nhật phiên bản.

---
*Tài liệu này được duy trì bởi Gemini CLI.*
