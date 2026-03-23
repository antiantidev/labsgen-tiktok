import fs from "node:fs"
import path from "node:path"

type TokenServiceOptions = {
  fsImpl?: typeof fs
  env?: NodeJS.ProcessEnv
  platform?: NodeJS.Platform
}

type TokenLoadResult = {
  token: string | null
  error: string | null
}

export class TokenService {
  private readonly fsImpl: typeof fs
  private readonly env: NodeJS.ProcessEnv
  private readonly platform: NodeJS.Platform

  constructor(options: TokenServiceOptions = {}) {
    this.fsImpl = options.fsImpl || fs
    this.env = options.env || process.env
    this.platform = options.platform || process.platform
  }

  loadLocalToken(): TokenLoadResult {
    if (this.platform !== "win32") {
      return {
        token: null,
        error: "Unsupported platform. Local token extraction is only available on Windows."
      }
    }

    const appData = this.env.APPDATA
    const localAppData = this.env.LOCALAPPDATA
    const dirs: string[] = []

    if (appData) {
      dirs.push(path.join(appData, "slobs-client", "Local Storage", "leveldb"))
    }
    if (localAppData) {
      dirs.push(path.join(localAppData, "Google", "Chrome", "User Data", "Default", "Local Storage", "leveldb"))
      dirs.push(path.join(localAppData, "BraveSoftware", "Brave-Browser", "User Data", "Default", "Local Storage", "leveldb"))
      dirs.push(path.join(localAppData, "Microsoft", "Edge", "User Data", "Default", "Local Storage", "leveldb"))
    }

    if (dirs.length === 0) {
      return {
        token: null,
        error: "Windows Environment Variables (APPDATA/LOCALAPPDATA) not found."
      }
    }

    const tokenRegex = /"apiToken":"([a-f0-9]+)"/gi
    for (const dir of dirs) {
      if (!this.fsImpl.existsSync(dir)) continue

      const files = this.fsImpl
        .readdirSync(dir)
        .filter((filename) => filename.endsWith(".log") || filename.endsWith(".ldb"))
        .map((filename) => path.join(dir, filename))
        .sort((a, b) => this.fsImpl.statSync(b).mtimeMs - this.fsImpl.statSync(a).mtimeMs)

      for (const file of files) {
        try {
          const raw = this.fsImpl.readFileSync(file, "utf8").replace(/\x00/g, "")
          tokenRegex.lastIndex = 0
          let match: RegExpExecArray | null = null
          let last: string | null = null
          while ((match = tokenRegex.exec(raw)) !== null) {
            last = match[1]
          }
          if (last) {
            return { token: last, error: null }
          }
        } catch {
          continue
        }
      }
    }

    return {
      token: null,
      error: "No API Token found in Streamlabs or Browsers. Please ensure you are logged in to Streamlabs.com."
    }
  }
}
