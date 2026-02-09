# Cấu trúc thư mục chi tiết - LABGEN TIKTOK (v0.10.0)

Tài liệu này liệt kê chi tiết vai trò của từng thư mục và tệp tin trọng yếu trong kiến trúc của ứng dụng.

### 📂 Root Directory
- `package.json`: Cấu hình dependencies, scripts build và thông tin metadata (v0.10.0).
- `electron.vite.config.js`: Cấu hình tích hợp giữa Electron và Vite cho Main, Preload và Renderer.
- `tailwind.config.js`: Định nghĩa Design System, biến màu (HSL) và phông chữ 'Plus Jakarta Sans'.
- `index.html`: Điểm nhập của Renderer process, nạp phông chữ và các thẻ meta.
- `GEMINI.md`: Tài liệu kỹ thuật tổng quan.

### 📂 services/ (Business Logic - "The Heart")
- `dbService.js`: Lớp tương tác SQLite. Quản lý 4 bảng: `accounts`, `settings`, `system_logs`, `categories`.
- `encryptionService.js`: Xử lý bảo mật cấp cao. Sử dụng `safeStorage` để mã hóa Token thành chuỗi Base64.
- `streamlabs.js`: Service tương tác API Streamlabs v5. Thực thi các lệnh `getInfo`, `startStream`, `endStream`.
- `tokenService.js`: Logic truy xuất tự động. Quét file LevelDB của Streamlabs Desktop và các trình duyệt (Chrome, Edge, Brave).
- `driverService.js`: Quản lý ChromeDriver. Tự động kiểm tra, tải và giải nén driver tương thích từ Google Labs.
- `seleniumToken.js`: Điều khiển trình duyệt tự động để bắt mã OAuth PKCE và đổi Token.

### 📂 src/main/ (Main Process - "The Kernel")
- `index.js`: Điểm khởi chạy của ứng dụng. Quản lý vòng đời cửa sổ, khởi tạo Tray (Khay hệ thống) và đăng ký duy nhất toàn bộ các IPC Handlers.

### 📂 src/preload/ (Bridge - "The Gatekeeper")
- `index.js`: Sử dụng `contextBridge` để phơi bày các hàm bảo mật cho Frontend thông qua đối tượng `window.api`.

### 📂 src/renderer/ (Frontend - "The Interface")
- `App.jsx`: Component gốc. Quản lý trạng thái toàn cục, hệ thống Loading, Toast và đồng bộ hóa SQLite Settings.
- `renderer.jsx`: Điểm nạp React vào DOM.
- `globals.css`: Định nghĩa các biến CSS (Light/Dark mode), vùng kéo cửa sổ (drag) và hiệu ứng Glassmorphism.
- `i18n.js`: Cấu hình đa ngôn ngữ sử dụng `i18next`.

#### 📂 src/pages/ (Application Views)
- `Dashboard.jsx`: Màn hình tổng quan với các StatCards và thao tác khởi động nhanh.
- `Console.jsx`: (Broadcast Hub) Điều khiển phiên Live, hiển thị RTMP URL và Stream Key.
- `LiveSetup.jsx`: (Metadata Config) Thiết lập tiêu đề và danh mục Live với cơ chế tìm kiếm Local chuẩn xác.
- `TokenVault.jsx`: (Identity Vault) Quản lý đa tài khoản, hiển thị trạng thái xác thực và quyền Ingest.
- `Pulse.jsx`: (Kernel Logs) Hệ thống giám sát sự kiện thời gian thực với thống kê chi tiết.
- `Settings.jsx`: (System Settings) Cấu hình vận hành, quản lý phông nền, ngôn ngữ và tài nguyên hệ thống.

#### 📂 src/components/ (Reusable Components)
- **layout/**:
    - `Sidebar.jsx`: Thanh điều hướng tràn lề (Edge-to-Edge) với hiệu ứng trượt Liquid.
    - `index.jsx`: Chứa `Titlebar` (nút điều khiển cửa sổ) và `PageContainer`.
- **ui/**:
    - `index.jsx`: Bộ thư viện thành phần nguyên tử: `Button`, `Card`, `Input`, `Checkbox`, `Switch`, `Toast`, `AlertBanner`, `LoadingOverlay`.

#### 📂 src/locales/ (Localization)
- `vi.json`: Bản dịch Tiếng Việt chuyên nghiệp với thuật ngữ kỹ thuật.
- `en.json`: Bản dịch Tiếng Anh theo chuẩn phần mềm quốc tế.

### 📂 build/ & resources/ (Assets & Packaging)
- `installer.nsh`: Script tùy biến cho trình cài đặt Windows (NSIS).
- `icon.png` / `icon.ico`: Biểu tượng ứng dụng ở các định dạng khác nhau.

### 📂 drivers/
- Thư mục động lưu trữ `chromedriver.exe` sau khi được ứng dụng bootstrap thành công.
