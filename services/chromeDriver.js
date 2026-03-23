const fs = require("fs");
const path = require("path");
const https = require("https");
const { execFileSync } = require("child_process");
const AdmZip = require("adm-zip");

const CHROME_CFT_MANIFEST_URL =
  "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json";

function fetchJson(url, httpsImpl = https) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl) => {
      httpsImpl
        .get(currentUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let nextUrl = res.headers.location;
            if (!nextUrl.startsWith("http")) {
              const urlObj = new URL(currentUrl);
              nextUrl = urlObj.origin + nextUrl;
            }
            return request(nextUrl);
          }

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
    };

    request(url);
  });
}

function downloadFile(url, dest, httpsImpl = https) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl) => {
      httpsImpl
        .get(currentUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let nextUrl = res.headers.location;
            if (!nextUrl.startsWith("http")) {
              const urlObj = new URL(currentUrl);
              nextUrl = urlObj.origin + nextUrl;
            }
            return request(nextUrl);
          }

          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Download failed: ${res.statusCode}`));
            return;
          }

          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on("finish", () => file.close(resolve));
        })
        .on("error", (err) => {
          fs.unlink(dest, () => reject(err));
        });
    };

    request(url);
  });
}

function extractZip(zipPath, destDir) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
}

function parseVersion(text) {
  const match = String(text || "").match(/(\d+\.\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

function escapePowerShellSingleQuoted(value) {
  return String(value).replace(/'/g, "''");
}

function readWindowsFileVersion(filePath, execFileSyncImpl = execFileSync) {
  try {
    const escaped = escapePowerShellSingleQuoted(filePath);
    const command = `(Get-Item -LiteralPath '${escaped}').VersionInfo.ProductVersion`;
    const output = execFileSyncImpl("powershell.exe", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      windowsHide: true
    });
    return parseVersion(output);
  } catch {
    return null;
  }
}

function resolveChromeBinaryPath({
  env = process.env,
  platform = process.platform,
  fsImpl = fs,
  execFileSyncImpl = execFileSync
} = {}) {
  const candidates = [];
  const push = (candidate) => {
    if (candidate && !candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  };

  push(env.CHROME_PATH);
  push(env.CHROME_BINARY);
  push(env.CHROME_EXE);

  if (platform === "win32") {
    const programFiles = [
      env.PROGRAMFILES,
      env["PROGRAMFILES(X86)"],
      env.LOCALAPPDATA,
      "C:\\Program Files",
      "C:\\Program Files (x86)"
    ].filter(Boolean);
    for (const base of programFiles) {
      push(path.join(base, "Google", "Chrome", "Application", "chrome.exe"));
      push(path.join(base, "Google", "Chrome SxS", "Application", "chrome.exe"));
    }

    for (const regKey of [
      "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe",
      "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe",
      "HKLM\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"
    ]) {
      try {
        const output = execFileSyncImpl("reg", ["query", regKey, "/ve"], {
          encoding: "utf8",
          windowsHide: true,
          stdio: ["ignore", "pipe", "ignore"]
        });
        const match = output.match(/REG_SZ\s+(.+?chrome\.exe)\s*$/im);
        if (match) {
          push(match[1].trim().replace(/^"+|"+$/g, ""));
        }
      } catch {
        // Ignore registry lookup errors and continue with filesystem candidates.
      }
    }
  }

  for (const candidate of candidates) {
    if (candidate && fsImpl.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function resolveChromeVersion({
  env = process.env,
  platform = process.platform,
  fsImpl = fs,
  execFileSyncImpl = execFileSync
} = {}) {
  const overrideVersion = String(env.CHROMEDRIVER_VERSION || env.CHROME_VERSION || "").trim();
  if (overrideVersion) {
    return {
      chromePath: env.CHROME_PATH || env.CHROME_BINARY || env.CHROME_EXE || null,
      version: overrideVersion,
      source: "env"
    };
  }

  const chromePath = resolveChromeBinaryPath({ env, platform, fsImpl, execFileSyncImpl });
  if (!chromePath) {
    return null;
  }

  try {
    if (platform === "win32") {
      const version = readWindowsFileVersion(chromePath, execFileSyncImpl);
      if (version) {
        return { chromePath, version, source: "binary" };
      }
      return null;
    }
  } catch {
    // Some builds expose the version via a different mechanism.
  }

  return null;
}

function resolveChromeDriverRelease(chromeVersion, versions = []) {
  if (!chromeVersion || !Array.isArray(versions) || !versions.length) {
    return null;
  }

  const normalized = String(chromeVersion).trim();
  const exact = versions.find((entry) => entry.version === normalized);
  if (exact) {
    return exact;
  }

  const major = normalized.split(".")[0];
  const sameMajor = versions.filter(
    (entry) => typeof entry.version === "string" && entry.version.startsWith(`${major}.`)
  );
  return sameMajor.length ? sameMajor[sameMajor.length - 1] : null;
}

module.exports = {
  CHROME_CFT_MANIFEST_URL,
  downloadFile,
  extractZip,
  fetchJson,
  parseVersion,
  readWindowsFileVersion,
  resolveChromeBinaryPath,
  resolveChromeDriverRelease,
  resolveChromeVersion
};
