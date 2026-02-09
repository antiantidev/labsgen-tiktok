# Labsgen Tiktok

<div align="center">
  <img src="resources/logo.svg" alt="Labsgen Tiktok Logo" width="120" height="120" />
  <p><strong>Professional StreamLabs TikTok Ingest & Metadata Orchestrator</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Version-0.12.0-primary?style=for-the-badge&logo=electron" alt="Version" />
    <img src="https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge&logo=windows" alt="Platform" />
    <img src="https://img.shields.io/badge/Framework-React_19-61DAFB?style=for-the-badge&logo=react" alt="Framework" />
    <img src="https://img.shields.io/badge/Database-SQLite_3-003B57?style=for-the-badge&logo=sqlite" alt="Database" />
  </p>
</div>

---

## 📖 Overview
**Labsgen Tiktok** is a professional desktop solution built on Electron that helps streamers optimize the extraction of **Ingest (RTMP URL & Stream Key)** from Streamlabs to broadcast live on TikTok.

The app combines the performance of **SQLite 3**, the security of **Electron safeStorage**, and a modern **Edge-to-Edge** design language to deliver a stable, premium streaming workflow.

## ✨ Key Features

*   🔑 **Identity Vault:** Multi-account management with OS-level AES-256 encryption. Supports automated browser token capture (Selenium) and local extraction.
*   🛰️ **Broadcast Hub:** Initialize and control live ingest endpoints in real time. UI optimized for copying RTMP URL and Stream Key.
*   📑 **Metadata Config:** Smart title and category setup with fast **Game Mask ID** matching from the internal SQLite cache.
*   🖥️ **Professional UI:** Modern edge-to-edge interface with high-contrast **Dark/Light Mode** and **Plus Jakarta Sans** typography.
*   🛡️ **Kernel Diagnostics:** Detailed kernel logs and monitoring of network and database status for reliable operations.
*   🤖 **Auto-Bootstrap:** Smart environment detection and automated ChromeDriver setup.

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

## 📂 Documentation

For deeper technical details, see:
- [**Architecture Overview (GEMINI.md)**](./GEMINI.md)
- [**Detailed Folder Structure**](./DOCS_STRUCTURE.md)
- [**Feature Deep Dive**](./DOCS_FEATURES.md)

## 📂 Version History (v0.12.0)
The current application runs on stable kernel v0.12.0.

## 📄 License & Contact
Developed by **Nhat Linh Nguyen**.  
License: **MIT License**.

---
<div align="center">
  <p>Built with ❤️ for the Streaming Community</p>
</div>
