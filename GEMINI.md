# GEMINI.md - Tài liệu Tổng quan LABGEN TIKTOK

Tài liệu này cung cấp thông tin chi tiết về cấu trúc kỹ thuật, công nghệ lõi và quy trình vận hành của ứng dụng **LABGEN TIKTOK**.

## 1. Tổng quan
**LABGEN TIKTOK** là một giải pháp desktop chuyên nghiệp (Electron) giúp các Streamer trích xuất thông số kỹ thuật **Ingest (RTMP URL & Stream Key)** từ Streamlabs để phát sóng trực tiếp lên nền tảng TikTok. Ứng dụng tập trung vào tính ổn định của hệ thống, bảo mật danh tính và trải nghiệm người dùng tối giản.

## 2. Công nghệ lõi (Tech Stack)

### ⚙️ Core Framework
- **Electron (v40+):** Môi trường runtime tối ưu hóa sâu cho hệ điều hành Windows.
- **Node.js:** Xử lý logic Main Process và tương tác hệ thống tệp tin.

### 🎨 Frontend & UI/UX
- **React 19:** Thư viện xây dựng giao diện người dùng hiện đại.
- **Tailwind CSS:** Quản lý Design System qua biến HSL.
- **Framer Motion:** Xử lý hiệu ứng chuyển cảnh và hoạt họa mượt mà.
- **Plus Jakarta Sans:** Phông chữ chủ đạo tối ưu hiển thị tiếng Việt.

### 💾 Data & Security
- **SQLite 3 (via `better-sqlite3`):** Cơ sở dữ liệu quan hệ cục bộ hiệu năng cao.
- **Electron `safeStorage` API:** Mã hóa Token bằng khóa phần cứng (AES-256).

### 🤖 Automation & infrastructure
- **Selenium WebDriver:** Điều khiển trình duyệt tự động để Capture Token.
- **electron-builder:** Trình đóng gói Windows Installer (NSIS MUI2).

## 3. Kiến trúc dự án
Để đảm bảo tính tra cứu nhanh chóng, tài liệu chi tiết đã được tách nhỏ:

- 📂 [**Cấu trúc thư mục chi tiết (v0.10.0)**](./DOCS_STRUCTURE.md): Liệt kê và giải thích vai trò của từng tệp tin trong dự án.
- ✨ [**Chi tiết các tính năng**](./DOCS_FEATURES.md): Phân tích sâu các chức năng Identity, Ingest, Kernel và Diagnostics.

## 4. Quy trình Phát triển & Đóng gói

- **Phát triển:** `npm run dev`
- **Biên dịch Driver (Native):** `npx electron-rebuild -f -w better-sqlite3`
- **Đóng gói Windows:** `npx electron-builder --win nsis --x64`

---
*Tài liệu này được duy trì và cập nhật bởi LABGEN TIKTOK Core Team.*