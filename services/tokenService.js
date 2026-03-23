const fs = require("fs");
const path = require("path");

class TokenService {
  constructor(options = {}) {
    this.fsImpl = options.fsImpl || fs;
    this.env = options.env || process.env;
    this.platform = options.platform || process.platform;
  }

  loadLocalToken() {
    if (this.platform !== "win32") {
      return { token: null, error: "Unsupported platform. Local token extraction is only available on Windows." };
    }

    const appdata = this.env.APPDATA;
    const localappdata = this.env.LOCALAPPDATA;

    const dirs = [];
    if (appdata) {
      dirs.push(path.join(appdata, "slobs-client", "Local Storage", "leveldb"));
    }
    if (localappdata) {
      dirs.push(path.join(localappdata, "Google", "Chrome", "User Data", "Default", "Local Storage", "leveldb"));
      dirs.push(path.join(localappdata, "BraveSoftware", "Brave-Browser", "User Data", "Default", "Local Storage", "leveldb"));
      dirs.push(path.join(localappdata, "Microsoft", "Edge", "User Data", "Default", "Local Storage", "leveldb"));
    }

    if (dirs.length === 0) {
      return { token: null, error: "Windows Environment Variables (APPDATA/LOCALAPPDATA) not found." };
    }

    const tokenRegex = /"apiToken":"([a-f0-9]+)"/gi;
    
    for (const dir of dirs) {
      if (!this.fsImpl.existsSync(dir)) continue;

      const files = this.fsImpl
        .readdirSync(dir)
        .filter((f) => f.endsWith(".log") || f.endsWith(".ldb"))
        .map((f) => path.join(dir, f))
        .sort((a, b) => this.fsImpl.statSync(b).mtimeMs - this.fsImpl.statSync(a).mtimeMs);

      for (const file of files) {
        try {
          const raw = this.fsImpl.readFileSync(file, "utf8").replace(/\x00/g, "");
          tokenRegex.lastIndex = 0;
          let match;
          let last = null;
          while ((match = tokenRegex.exec(raw)) !== null) {
            last = match[1];
          }
          if (last) {
            return { token: last, error: null };
          }
        } catch (err) {
          continue; // Skip locked or unreadable files
        }
      }
    }

    return {
      token: null,
      error: "No API Token found in Streamlabs or Browsers. Please ensure you are logged in to Streamlabs.com."
    };
  }
}

module.exports = { TokenService };
