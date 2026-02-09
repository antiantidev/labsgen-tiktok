const fs = require("fs");
const path = require("path");

class TokenService {
  constructor(options = {}) {
    this.fsImpl = options.fsImpl || fs;
    this.env = options.env || process.env;
  }

  loadLocalToken() {
    const appdata = this.env.APPDATA;
    const localappdata = this.env.LOCALAPPDATA;
    
    if (!appdata || !localappdata) {
      return { token: null, error: "Windows Environment Variables (APPDATA/LOCALAPPDATA) not found." };
    }

    const dirs = [
      path.join(appdata, "slobs-client", "Local Storage", "leveldb"),
      path.join(localappdata, "Google", "Chrome", "User Data", "Default", "Local Storage", "leveldb"),
      path.join(localappdata, "BraveSoftware", "Brave-Browser", "User Data", "Default", "Local Storage", "leveldb"),
      path.join(localappdata, "Microsoft", "Edge", "User Data", "Default", "Local Storage", "leveldb")
    ];

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