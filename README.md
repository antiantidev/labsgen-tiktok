# LABGEN TIKTOK

<div align="center">
  <img src="resources/logo.svg" alt="LABGEN TIKTOK Logo" width="120" height="120" />
  <p><strong>Professional StreamLabs TikTok Ingest & Metadata Orchestrator</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Version-0.12.0-primary?style=for-the-badge&logo=electron" alt="Version" />
    <img src="https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge&logo=windows" alt="Platform" />
    <img src="https://img.shields.io/badge/Framework-React_19-61DAFB?style=for-the-badge&logo=react" alt="Framework" />
    <img src="https://img.shields.io/badge/Database-SQLite_3-003B57?style=for-the-badge&logo=sqlite" alt="Database" />
  </p>
</div>

---

## 📖 Giới thiệu
**LABGEN TIKTOK** là giải pháp Desktop chuyên nghiệp được xây dựng trên nền tảng Electron, giúp các Streamer tối ưu hóa quy trình trích xuất thông số **Ingest (RTMP URL & Stream Key)** từ hệ thống Streamlabs để phát sóng trực tiếp lên TikTok. 

Ứng dụng kết hợp giữa hiệu năng mạnh mẽ của **SQLite 3**, tính bảo mật tuyệt đối của **Electron safeStorage** và ngôn ngữ thiết kế **Edge-to-Edge** hiện đại, mang lại trải nghiệm vận hành luồng phát ổn định và đẳng cấp.

## ✨ Tính năng nổi bật

*   🔑 **Identity Vault:** Quản lý đa tài khoản với cơ chế mã hóa AES-256 cấp độ hệ điều hành. Hỗ trợ bắt giữ Token qua trình duyệt tự động (Selenium) và truy xuất cục bộ.
*   🛰️ **Broadcast Hub:** Khởi tạo và điều khiển Endpoint phát sóng thời gian thực. Giao diện trực quan cho việc sao chép RTMP URL và Stream Key.
*   📑 **Metadata Config:** Hệ thống thiết lập tiêu đề và danh mục Live thông minh. Tự động khớp **Game Mask ID** từ kho dữ liệu SQLite nội bộ với tốc độ phản hồi tức thì.
*   🖥️ **Professional UI:** Giao diện tràn lề hiện đại, hỗ trợ **Dark/Light Mode** độ tương phản cao, sử dụng phông chữ **Plus Jakarta Sans** tối ưu cho tiếng Việt.
*   🛡️ **Kernel Diagnostics:** Hệ thống nhật ký Kernel chi tiết, giám sát mọi giao thức mạng và trạng thái Database để đảm bảo vận hành không lỗi.
*   🤖 **Auto-Bootstrap:** Tự động nhận diện môi trường và thiết lập Driver hệ thống (ChromeDriver) một cách thông minh.

## 🛠️ Công nghệ cốt lõi

- **Core:** Electron v40+ (Windows Optimized)
- **Frontend:** React 19, Tailwind CSS, Framer Motion
- **Database:** SQLite 3 (via `better-sqlite3`)
- **Security:** Windows safeStorage API
- **Automation:** Selenium WebDriver
- **Infrastructure:** electron-vite, electron-builder (NSIS MUI2)

## 🚀 Bắt đầu sử dụng

### Yêu cầu hệ thống
- Windows 10/11 (x64)
- Google Chrome (phiên bản mới nhất)

### Cài đặt phát triển
```bash
# Clone dự án
git clone https://github.com/antiantidev/labs-gen-tik.git

# Cài đặt dependencies
npm install

# Biên dịch các module Native (SQLite)
npx electron-rebuild -f -w better-sqlite3

# Khởi chạy chế độ Development
npm run dev
```

### Đóng gói ứng dụng
```bash
# Tạo bản cài đặt Windows chuyên nghiệp (.exe)
npm run build
npx electron-builder --win nsis --x64
```

## 📂 Tài liệu chi tiết

Để hiểu sâu hơn về kiến trúc và cách thức vận hành, vui lòng tham khảo:
- [**Kiến trúc tổng quan (GEMINI.md)**](./GEMINI.md)
- [**Cấu trúc thư mục chi tiết**](./DOCS_STRUCTURE.md)
- [**Phân tích sâu tính năng**](./DOCS_FEATURES.md)

## 📂 Version History (v0.12.0)
Ứng dụng hiện tại đang hoạt động trên nhân Kernel ổn định v0.12.0.

## 📄 Bản quyền & Liên hệ
Dự án được phát triển bởi **Nhat Linh Nguyen**. 
Giấy phép: **MIT License**.

---
<div align="center">
  <p>Built with ❤️ for the Streaming Community</p>
</div>
