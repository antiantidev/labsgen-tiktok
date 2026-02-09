const fs = require("fs");
const path = require("path");
const https = require("https");
const { pipeline } = require("stream");
const AdmZip = require("adm-zip");

class DriverService {
  constructor(appPath, userDataPath) {
    this.driversDir = path.join(userDataPath, "drivers");
    this.driverPath = path.join(this.driversDir, "chromedriver-win64", "chromedriver.exe");
    this.knownGoodUrl = "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json";
    this.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  }

  getExecutablePath() {
    return this.driverPath;
  }

  async checkDriver() {
    return fs.existsSync(this.driverPath);
  }

  async setupDriver(onProgress) {
    if (await this.checkDriver()) return { ok: true, alreadyExists: true };

    if (onProgress) onLog(onProgress, "Initializing environment...", "info");
    
    if (!fs.existsSync(this.driversDir)) {
      fs.mkdirSync(this.driversDir, { recursive: true });
    }

    try {
      const defaultVersion = "144.0.7559.133"; 

      if (onProgress) onLog(onProgress, "Fetching version manifest...", "info");
      const json = await this._fetchJson(this.knownGoodUrl);
      const versions = json.versions || [];
      const match = versions.find((v) => v.version === defaultVersion) || 
                    versions.filter((v) => v.version.startsWith(defaultVersion.split(".")[0] + ".")).slice(-1)[0];

      if (!match) throw new Error(`No matching ChromeDriver for version ${defaultVersion}`);

      const download = match.downloads.chromedriver.find((d) => d.platform === "win64") || match.downloads.chromedriver[0];

      if (onProgress) onLog(onProgress, `Downloading binary (v${match.version})...`, "info");
      const zipPath = path.join(this.driversDir, "chromedriver.zip");
      
      // Attempt download
      await this._downloadFile(download.url, zipPath);

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
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(this.driversDir, true);
      } catch (zipErr) {
        throw new Error(`Extraction failed: ${zipErr.message}`);
      }
      
      // Clean up zip
      try { fs.unlinkSync(zipPath); } catch(e) {}

      if (onProgress) onLog(onProgress, "ChromeDriver system ready.", "success");
      return { ok: true };
    } catch (err) {
      if (onProgress) onLog(onProgress, `Setup error: ${err.message}`, "error");
      throw err;
    }
  }

  _fetchJson(url) {
    return new Promise((resolve, reject) => {
      const options = { headers: { 'User-Agent': this.userAgent } };
      https.get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(data)); } catch(e) { reject(new Error("Manifest parse error")); }
        });
      }).on("error", reject);
    });
  }

  _downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const request = (currentUrl) => {
        const options = { headers: { 'User-Agent': this.userAgent } };

        https.get(currentUrl, options, (res) => {
          // Handle redirects
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let nextUrl = res.headers.location;
            if (!nextUrl.startsWith('http')) {
              const urlObj = new URL(currentUrl);
              nextUrl = urlObj.origin + nextUrl;
            }
            return request(nextUrl);
          }

          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }

          const fileStream = fs.createWriteStream(dest);
          pipeline(res, fileStream, (err) => {
            if (err) {
              fs.unlink(dest, () => reject(err));
            } else {
              resolve();
            }
          });
        }).on("error", reject);
      };
      request(url);
    });
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