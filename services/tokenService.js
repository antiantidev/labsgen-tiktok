const fs = require("fs");
const os = require("os");
const path = require("path");

class TokenService {
  constructor(options = {}) {
    this.fsImpl = options.fsImpl || fs;
    this.platform = options.platform || os.platform();
    this.homedir = options.homedir || os.homedir();
    this.env = options.env || process.env;
  }

  loadLocalToken() {
    const platform = this.platform;
    let dir = null;

    if (platform === "win32") {
      const appdata = this.env.APPDATA;
      if (!appdata) {
        return { token: null, error: "APPDATA not found." };
      }
      dir = path.join(appdata, "slobs-client", "Local Storage", "leveldb");
    } else if (platform === "darwin") {
      dir = path.join(
        this.homedir,
        "Library",
        "Application Support",
        "slobs-client",
        "Local Storage",
        "leveldb"
      );
    } else {
      return {
        token: null,
        error: "Unsupported operating system for local token retrieval."
      };
    }

    if (!this.fsImpl.existsSync(dir)) {
      return { token: null, error: "Streamlabs data folder not found." };
    }

    const files = this.fsImpl
      .readdirSync(dir)
      .filter((f) => f.endsWith(".log"))
      .map((f) => path.join(dir, f))
      .sort((a, b) => this.fsImpl.statSync(b).mtimeMs - this.fsImpl.statSync(a).mtimeMs);

    const tokenRegex = /"apiToken":"([a-f0-9]+)"/gi;
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
        return { token: null, error: `Error reading file ${file}: ${err}` };
      }
    }

    return {
      token: null,
      error:
        "No API Token found locally. Make sure Streamlabs is installed and you're logged in using TikTok."
    };
  }
}

module.exports = { TokenService };
