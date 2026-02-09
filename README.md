# Labsgen Tiktok - TikTok Live Stream Key Generator

<div align="center">
  <img src="resources/logo.svg" alt="Labsgen Tiktok Logo" width="120" height="120" />
  <p><strong>TikTok Live Stream Key Generator for OBS from Streamlabs</strong></p>
  <p><em>Labsgen Tiktok is a Windows TikTok Live Stream Key Generator that helps creators fetch RTMP URL and Stream Key for OBS quickly and safely.</em></p>
  <p>
    <img src="https://img.shields.io/badge/Version-0.17.2-primary?style=for-the-badge&logo=electron" alt="Version" />
    <img src="https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge&logo=windows" alt="Platform" />
    <img src="https://img.shields.io/badge/Framework-React_19-61DAFB?style=for-the-badge&logo=react" alt="Framework" />
    <img src="https://img.shields.io/badge/Database-SQLite_3-003B57?style=for-the-badge&logo=sqlite" alt="Database" />
  </p>
  <p>
    <a href="https://ko-fi.com/chokernguyen">
      <img src="https://img.shields.io/badge/Donate-Ko--fi-ff5f5f?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Donate on Ko-fi" />
    </a>
  </p>
</div>

---

## 📖 Overview
**Labsgen Tiktok** is a desktop **TikTok Live Stream Key Generator** that retrieves **RTMP URL and Stream Key** from Streamlabs for use in OBS.

The app combines the performance of **SQLite 3**, the security of **Electron safeStorage**, and a modern **Edge-to-Edge** design language to deliver a stable, premium streaming workflow.

If you need a **TikTok Live Stream Key Generator** for Windows, Labsgen Tiktok focuses on fast setup, reliable account handling, and clear streaming metadata.

## ✨ Key Features

*   🔑 **Identity Vault:** Multi-account management with OS-level AES-256 encryption. Supports automated browser token capture (Selenium) and local extraction.
*   🛰️ **Broadcast Hub:** Initialize and control live ingest endpoints in real time. UI optimized for copying RTMP URL and Stream Key.
*   📑 **Metadata Config:** Smart title and category setup with fast **Game Mask ID** matching from the internal SQLite cache.
*   🖥️ **Professional UI:** Modern edge-to-edge interface with high-contrast **Dark/Light Mode** and **Plus Jakarta Sans** typography.
*   🛡️ **Kernel Diagnostics:** Detailed kernel logs and monitoring of network and database status for reliable operations.
*   🤖 **Auto-Bootstrap:** Smart environment detection and automated ChromeDriver setup.

## 🖼️ Screenshots
![Screenshot 01](resources/screenshots/screenshot-01.png)
![Screenshot 02](resources/screenshots/screenshot-02.png)
![Screenshot 03](resources/screenshots/screenshot-03.png)
![Screenshot 04](resources/screenshots/screenshot-04.png)
![Screenshot 05](resources/screenshots/screenshot-05.png)
![Screenshot 06](resources/screenshots/screenshot-06.png)

## 🛠️ Core Stack

- **Core:** Electron v40+ (Windows optimized)
- **Frontend:** React 19, Tailwind CSS, Framer Motion
- **Database:** SQLite 3 (via `better-sqlite3`)
- **Security:** Windows safeStorage API
- **Automation:** Selenium WebDriver
- **Infrastructure:** electron-vite, electron-builder (NSIS MUI2)

## 🚀 Getting Started

### System Requirements
- Windows 10/11 (x64)
- Google Chrome (latest version)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/antiantidev/labsgen-tiktok.git

# Install dependencies
npm install

# Rebuild native modules (SQLite)
npx electron-rebuild -f -w better-sqlite3

# Start in Development mode
npm run dev
```

### Build for Release
```bash
# Build a professional Windows installer (.exe)
npm run build
npx electron-builder --win nsis --x64
```

## 📄 License & Contact
Developed by **Nhat Linh Nguyen**.  
License: **MIT License**.

---
<div align="center">
  <p>Built with ❤️ for the Streamer</p>
</div>
