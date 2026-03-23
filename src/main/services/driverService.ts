import fs from "node:fs"
import path from "node:path"
import {
  CHROME_CFT_MANIFEST_URL,
  downloadFile,
  extractZip,
  fetchJson,
  resolveChromeDriverRelease,
  resolveChromeVersion
} from "./chromeDriver.ts"

type DriverMetadata = {
  chromeVersion: string
  chromeMajor: string
  chromePath: string | null
  driverVersion?: string
  downloadedAt: string
}

type ChromeVersionInfo = {
  chromePath: string | null
  version: string
}

type ChromeForTestingManifest = {
  versions?: Array<{
    version?: string
    downloads?: {
      chromedriver?: Array<{
        platform: string
        url: string
      }>
    }
  }>
}

export class DriverService {
  private readonly driversDir: string
  private readonly driverPath: string
  private readonly metadataPath: string
  private readonly knownGoodUrl: string
  private readonly chromeVersionResolver: () => ChromeVersionInfo | null
  private readonly fetchManifest: (url: string) => Promise<ChromeForTestingManifest>
  private readonly downloadBinary: (url: string, dest: string) => Promise<void>
  private readonly unzipBinary: (zipPath: string, destDir: string) => void

  constructor(_appPath: string, userDataPath: string) {
    this.driversDir = path.join(userDataPath, "drivers")
    this.driverPath = path.join(this.driversDir, "chromedriver-win64", "chromedriver.exe")
    this.metadataPath = path.join(this.driversDir, "chromedriver.json")
    this.knownGoodUrl = CHROME_CFT_MANIFEST_URL
    this.chromeVersionResolver = resolveChromeVersion
    this.fetchManifest = (url) => fetchJson<ChromeForTestingManifest>(url)
    this.downloadBinary = downloadFile
    this.unzipBinary = extractZip
  }

  getExecutablePath(): string {
    return this.driverPath
  }

  async checkDriver(): Promise<boolean> {
    if (!fs.existsSync(this.driverPath)) {
      return false
    }

    const metadata = this.readMetadata()
    if (!metadata || !metadata.chromeMajor) {
      return false
    }

    const chrome = this.chromeVersionResolver()
    if (!chrome || !chrome.version) {
      return false
    }

    return metadata.chromeMajor === chrome.version.split(".")[0]
  }

  async ensureDriver(onProgress?: (status: string) => void): Promise<{ ok: true; alreadyExists?: boolean }> {
    if (await this.checkDriver()) {
      return { ok: true, alreadyExists: true }
    }
    return this.setupDriver(onProgress)
  }

  async setupDriver(onProgress?: (status: string) => void): Promise<{ ok: true }> {
    if (onProgress) {
      onLog(onProgress, "Initializing environment...", "info")
    }

    if (!fs.existsSync(this.driversDir)) {
      fs.mkdirSync(this.driversDir, { recursive: true })
    }

    try {
      const chrome = this.chromeVersionResolver()
      if (!chrome || !chrome.version) {
        const err = new Error("Google Chrome was not found. Install Chrome or set CHROME_PATH to your chrome.exe.") as Error & {
          code?: string
        }
        err.code = "CHROME_NOT_FOUND"
        throw err
      }

      if (onProgress) onLog(onProgress, `Detected Chrome ${chrome.version}. Fetching matching driver...`, "info")
      const json = await this.fetchManifest(this.knownGoodUrl)
      const versions = json.versions || []
      const match = resolveChromeDriverRelease(chrome.version, versions)
      if (!match) throw new Error(`No matching ChromeDriver for Chrome ${chrome.version}`)

      const download =
        (match.downloads?.chromedriver || []).find((entry) => entry.platform === "win64") ||
        (match.downloads?.chromedriver || [])[0]
      if (!download?.url) {
        throw new Error("No ChromeDriver downloads were found for the detected browser version.")
      }

      if (onProgress) onLog(onProgress, `Downloading binary (v${match.version})...`, "info")
      const zipPath = path.join(this.driversDir, "chromedriver.zip")
      await this.downloadBinary(download.url, zipPath)

      if (onProgress) onLog(onProgress, "Verifying integrity...", "info")
      if (!fs.existsSync(zipPath)) {
        throw new Error("Download failed: File could not be found after transfer.")
      }

      const stats = fs.statSync(zipPath)
      if (stats.size < 1000) {
        const content = fs.readFileSync(zipPath, "utf8").slice(0, 100)
        throw new Error(`Download failed: File too small (${stats.size} bytes). Server might have returned an error: ${content}`)
      }

      if (onProgress) onLog(onProgress, "Extracting assets...", "info")
      try {
        this.unzipBinary(zipPath, this.driversDir)
      } catch (zipErr) {
        throw new Error(`Extraction failed: ${zipErr instanceof Error ? zipErr.message : String(zipErr)}`)
      }

      try {
        fs.unlinkSync(zipPath)
      } catch {
        // Ignore cleanup failures.
      }

      this.writeMetadata({
        chromeVersion: chrome.version,
        chromeMajor: chrome.version.split(".")[0],
        chromePath: chrome.chromePath || null,
        driverVersion: match.version,
        downloadedAt: new Date().toISOString()
      })

      if (onProgress) onLog(onProgress, "ChromeDriver system ready.", "success")
      return { ok: true }
    } catch (err) {
      if (onProgress) onLog(onProgress, `Setup error: ${err instanceof Error ? err.message : String(err)}`, "error")
      throw err
    }
  }

  private readMetadata(): DriverMetadata | null {
    try {
      if (!fs.existsSync(this.metadataPath)) {
        return null
      }
      return JSON.parse(fs.readFileSync(this.metadataPath, "utf8")) as DriverMetadata
    } catch {
      return null
    }
  }

  private writeMetadata(metadata: DriverMetadata): void {
    try {
      fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2))
    } catch {
      // Metadata is best-effort.
    }
  }
}

function onLog(callback: (status: string) => void, message: string, _level: "info" | "success" | "error"): void {
  callback(message)
}
