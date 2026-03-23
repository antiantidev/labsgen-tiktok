const fs = require("fs");
const path = require("path");
const {
  CHROME_CFT_MANIFEST_URL,
  downloadFile,
  extractZip,
  fetchJson,
  resolveChromeDriverRelease,
  resolveChromeVersion
} = require("./chromeDriver");

class DriverService {
  constructor(appPath, userDataPath) {
    this.driversDir = path.join(userDataPath, "drivers");
    this.driverPath = path.join(this.driversDir, "chromedriver-win64", "chromedriver.exe");
    this.metadataPath = path.join(this.driversDir, "chromedriver.json");
    this.knownGoodUrl = CHROME_CFT_MANIFEST_URL;
    this.chromeVersionResolver = resolveChromeVersion;
    this.fetchJson = fetchJson;
    this.downloadFile = downloadFile;
    this.extractZip = extractZip;
  }

  getExecutablePath() {
    return this.driverPath;
  }

  async checkDriver() {
    if (!fs.existsSync(this.driverPath)) {
      return false;
    }

    const metadata = this._readMetadata();
    if (!metadata || !metadata.chromeMajor) {
      return false;
    }

    const chrome = this.chromeVersionResolver();
    if (!chrome || !chrome.version) {
      return false;
    }

    return metadata.chromeMajor === chrome.version.split(".")[0];
  }

  async ensureDriver(onProgress) {
    if (await this.checkDriver()) {
      return { ok: true, alreadyExists: true };
    }

    return this.setupDriver(onProgress);
  }

  async setupDriver(onProgress) {
    if (onProgress) onLog(onProgress, "Initializing environment...", "info");

    if (!fs.existsSync(this.driversDir)) {
      fs.mkdirSync(this.driversDir, { recursive: true });
    }

    try {
      const chrome = this.chromeVersionResolver();
      if (!chrome || !chrome.version) {
        const err = new Error("Google Chrome was not found. Install Chrome or set CHROME_PATH to your chrome.exe.");
        err.code = "CHROME_NOT_FOUND";
        throw err;
      }

      if (onProgress) onLog(onProgress, `Detected Chrome ${chrome.version}. Fetching matching driver...`, "info");
      const json = await this.fetchJson(this.knownGoodUrl);
      const versions = json.versions || [];
      const match = resolveChromeDriverRelease(chrome.version, versions);

      if (!match) throw new Error(`No matching ChromeDriver for Chrome ${chrome.version}`);

      const download = match.downloads && match.downloads.chromedriver && (
        match.downloads.chromedriver.find((d) => d.platform === "win64") ||
        match.downloads.chromedriver[0]
      );
      if (!download) {
        throw new Error("No ChromeDriver downloads were found for the detected browser version.");
      }

      if (onProgress) onLog(onProgress, `Downloading binary (v${match.version})...`, "info");
      const zipPath = path.join(this.driversDir, "chromedriver.zip");

      await this.downloadFile(download.url, zipPath);

      if (onProgress) onLog(onProgress, "Verifying integrity...", "info");
      if (!fs.existsSync(zipPath)) {
        throw new Error("Download failed: File could not be found after transfer.");
      }

      const stats = fs.statSync(zipPath);
      if (stats.size < 1000) {
        const content = fs.readFileSync(zipPath, 'utf8').slice(0, 100);
        throw new Error(`Download failed: File too small (${stats.size} bytes). Server might have returned an error: ${content}`);
      }

      if (onProgress) onLog(onProgress, "Extracting assets...", "info");
      try {
        this.extractZip(zipPath, this.driversDir);
      } catch (zipErr) {
        throw new Error(`Extraction failed: ${zipErr.message}`);
      }

      try {
        fs.unlinkSync(zipPath);
      } catch {
        // Ignore cleanup failures.
      }

      this._writeMetadata({
        chromeVersion: chrome.version,
        chromeMajor: chrome.version.split(".")[0],
        chromePath: chrome.chromePath || null,
        driverVersion: match.version,
        downloadedAt: new Date().toISOString()
      });

      if (onProgress) onLog(onProgress, "ChromeDriver system ready.", "success");
      return { ok: true };
    } catch (err) {
      if (onProgress) onLog(onProgress, `Setup error: ${err.message}`, "error");
      throw err;
    }
  }

  _readMetadata() {
    try {
      if (!fs.existsSync(this.metadataPath)) {
        return null;
      }
      return JSON.parse(fs.readFileSync(this.metadataPath, "utf8"));
    } catch {
      return null;
    }
  }

  _writeMetadata(metadata) {
    try {
      fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2));
    } catch {
      // Metadata is best-effort. The installed binary is still usable even if we fail to write it.
    }
  }
}

// Helper to bridge status updates to logs
function onLog(cb, message, level) {
  if (typeof cb === 'function') {
    // If the callback expects a string, send it. 
    // If we want more info, we'd need to update the IPC.
    cb(message);
  }
}

module.exports = { DriverService };
