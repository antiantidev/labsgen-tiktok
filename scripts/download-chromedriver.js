const fs = require("fs");
const path = require("path");
const https = require("https");
const AdmZip = require("adm-zip");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DRIVERS_DIR = path.join(PROJECT_ROOT, "drivers");
const DEFAULT_VERSION = process.env.CHROMEDRIVER_VERSION || process.env.CHROME_VERSION || "144.0.7559.133";

const KNOWN_GOOD_URL =
  "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

async function main() {
  if (!fs.existsSync(DRIVERS_DIR)) {
    fs.mkdirSync(DRIVERS_DIR, { recursive: true });
  }

  const json = await fetchJson(KNOWN_GOOD_URL);
  const versions = json.versions || [];
  const match =
    versions.find((v) => v.version === DEFAULT_VERSION) ||
    versions
      .filter((v) => v.version.startsWith(DEFAULT_VERSION.split(".")[0] + "."))
      .slice(-1)[0];

  if (!match) {
    throw new Error(`No matching ChromeDriver version for ${DEFAULT_VERSION}`);
  }

  const downloads = match.downloads && match.downloads.chromedriver;
  if (!downloads || !downloads.length) {
    throw new Error("No chromedriver downloads found");
  }

  const win = downloads.find((d) => d.platform === "win64") || downloads[0];
  const zipPath = path.join(DRIVERS_DIR, "chromedriver.zip");
  await downloadFile(win.url, zipPath);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(DRIVERS_DIR, true);
  fs.unlinkSync(zipPath);

  console.log(`Chromedriver installed: ${win.url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
