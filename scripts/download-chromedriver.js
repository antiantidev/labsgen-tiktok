const fs = require("fs");
const path = require("path");
const {
  CHROME_CFT_MANIFEST_URL,
  downloadFile,
  extractZip,
  fetchJson,
  resolveChromeDriverRelease,
  resolveChromeVersion
} = require("../services/chromeDriver");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DRIVERS_DIR = path.join(PROJECT_ROOT, "drivers");

async function main() {
  if (!fs.existsSync(DRIVERS_DIR)) {
    fs.mkdirSync(DRIVERS_DIR, { recursive: true });
  }

  const chrome = resolveChromeVersion();
  if (!chrome || !chrome.version) {
    throw new Error("Google Chrome was not found. Install Chrome or set CHROME_PATH to your chrome.exe.");
  }

  const json = await fetchJson(CHROME_CFT_MANIFEST_URL);
  const versions = json.versions || [];
  const match = resolveChromeDriverRelease(chrome.version, versions);

  if (!match) {
    throw new Error(`No matching ChromeDriver version for Chrome ${chrome.version}`);
  }

  const downloads = match.downloads && match.downloads.chromedriver;
  if (!downloads || !downloads.length) {
    throw new Error("No chromedriver downloads found");
  }

  const win = downloads.find((d) => d.platform === "win64") || downloads[0];
  const zipPath = path.join(DRIVERS_DIR, "chromedriver.zip");
  await downloadFile(win.url, zipPath);

  extractZip(zipPath, DRIVERS_DIR);
  fs.unlinkSync(zipPath);

  console.log(`Detected Chrome ${chrome.version}`);
  console.log(`Chromedriver installed: ${win.url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
