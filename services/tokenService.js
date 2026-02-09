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
    const dirs = [];

    if (platform === "win32") {
      const appdata = this.env.APPDATA;
      const localappdata = this.env.LOCALAPPDATA;
      
      if (appdata) {
        dirs.push(path.join(appdata, "slobs-client", "Local Storage", "leveldb"));
      }
      
      if (localappdata) {
        // Common Browser paths
        dirs.push(path.join(localappdata, "Google", "Chrome", "User Data", "Default", "Local Storage", "leveldb"));
        dirs.push(path.join(localappdata, "BraveSoftware", "Brave-Browser", "User Data", "Default", "Local Storage", "leveldb"));
        dirs.push(path.join(localappdata, "Microsoft", "Edge", "User Data", "Default", "Local Storage", "leveldb"));
      }
    } else if (platform === "darwin") {
      dirs.push(path.join(this.homedir, "Library", "Application Support", "slobs-client", "Local Storage", "leveldb"));
      dirs.push(path.join(this.homedir, "Library", "Application Support", "Google", "Chrome", "Default", "Local Storage", "leveldb"));
    } else if (platform === "linux" && os.release().toLowerCase().includes("microsoft")) {
      // WSL Support
      try {
        const { execSync } = require("child_process");
        const appdata = execSync('cmd.exe /c "echo %APPDATA%"', { encoding: "utf8" }).trim();
        if (appdata) {
          const wslPath = execSync(`wslpath "${appdata}"`, { encoding: "utf8" }).trim();
          dirs.push(path.join(wslPath, "slobs-client", "Local Storage", "leveldb"));
        }
      } catch (err) {
        // Silently continue to use other logic
      }
    } else {
      return {
        token: null,
        error: "Unsupported operating system for local token retrieval."
      };
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
          // Some files might be locked, so we use a try-catch for each file
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
          // Skip files that can't be read
          continue;
        }
      }
    }

    return {
      token: null,
      error:
        "No API Token found locally. Make sure Streamlabs is installed or you are logged in to Streamlabs in your browser."
    };
  }
}

module.exports = { TokenService };
