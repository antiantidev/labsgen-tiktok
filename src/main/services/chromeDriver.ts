import fs from "node:fs"
import path from "node:path"
import https from "node:https"
import { execFileSync } from "node:child_process"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const AdmZip = require("adm-zip") as new (zipPath: string) => { extractAllTo: (destDir: string, overwrite?: boolean) => void }

export const CHROME_CFT_MANIFEST_URL =
  "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json"

type HttpsLike = {
  get: typeof https.get
}

type ChromeForTestingVersion = {
  version?: string
  downloads?: {
    chromedriver?: Array<{ platform: string; url: string }>
  }
}

export function fetchJson<T>(url: string, httpsImpl: HttpsLike = https): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = (currentUrl: string) => {
      httpsImpl
        .get(currentUrl, (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const nextUrl = res.headers.location.startsWith("http")
              ? res.headers.location
              : new URL(res.headers.location, currentUrl).toString()
            request(nextUrl)
            return
          }

          let data = ""
          res.on("data", (chunk) => {
            data += String(chunk)
          })
          res.on("end", () => {
            try {
              resolve(JSON.parse(data) as T)
            } catch (err) {
              reject(err)
            }
          })
        })
        .on("error", reject)
    }
    request(url)
  })
}

export function downloadFile(url: string, dest: string, httpsImpl: HttpsLike = https): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = (currentUrl: string) => {
      httpsImpl
        .get(currentUrl, (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const nextUrl = res.headers.location.startsWith("http")
              ? res.headers.location
              : new URL(res.headers.location, currentUrl).toString()
            request(nextUrl)
            return
          }

          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Download failed: ${res.statusCode}`))
            return
          }

          const file = fs.createWriteStream(dest)
          res.pipe(file)
          file.on("finish", () => {
            file.close(() => resolve())
          })
          file.on("error", reject)
        })
        .on("error", (err) => {
          fs.unlink(dest, () => reject(err))
        })
    }
    request(url)
  })
}

export function extractZip(zipPath: string, destDir: string): void {
  const zip = new AdmZip(zipPath)
  zip.extractAllTo(destDir, true)
}

export function parseVersion(text: string): string | null {
  const match = String(text || "").match(/(\d+\.\d+\.\d+\.\d+)/)
  return match ? match[1] : null
}

function escapePowerShellSingleQuoted(value: string): string {
  return String(value).replace(/'/g, "''")
}

export function readWindowsFileVersion(filePath: string, execFileSyncImpl: typeof execFileSync = execFileSync): string | null {
  try {
    const escaped = escapePowerShellSingleQuoted(filePath)
    const command = `(Get-Item -LiteralPath '${escaped}').VersionInfo.ProductVersion`
    const output = execFileSyncImpl("powershell.exe", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      windowsHide: true
    })
    return parseVersion(output)
  } catch {
    return null
  }
}

type ResolveChromeOptions = {
  env?: NodeJS.ProcessEnv
  platform?: NodeJS.Platform
  fsImpl?: typeof fs
  execFileSyncImpl?: typeof execFileSync
}

export function resolveChromeBinaryPath({
  env = process.env,
  platform = process.platform,
  fsImpl = fs,
  execFileSyncImpl = execFileSync
}: ResolveChromeOptions = {}): string | null {
  const candidates: string[] = []
  const push = (candidate?: string | null) => {
    if (candidate && !candidates.includes(candidate)) {
      candidates.push(candidate)
    }
  }

  push(env.CHROME_PATH)
  push(env.CHROME_BINARY)
  push(env.CHROME_EXE)

  if (platform === "win32") {
    const programFiles = [
      env.PROGRAMFILES,
      env["PROGRAMFILES(X86)"],
      env.LOCALAPPDATA,
      "C:\\Program Files",
      "C:\\Program Files (x86)"
    ].filter(Boolean) as string[]

    for (const base of programFiles) {
      push(path.join(base, "Google", "Chrome", "Application", "chrome.exe"))
      push(path.join(base, "Google", "Chrome SxS", "Application", "chrome.exe"))
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
        })
        const match = output.match(/REG_SZ\s+(.+?chrome\.exe)\s*$/im)
        if (match) {
          push(match[1].trim().replace(/^"+|"+$/g, ""))
        }
      } catch {
        continue
      }
    }
  }

  for (const candidate of candidates) {
    if (fsImpl.existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

export function resolveChromeVersion({
  env = process.env,
  platform = process.platform,
  fsImpl = fs,
  execFileSyncImpl = execFileSync
}: ResolveChromeOptions = {}): { chromePath: string | null; version: string; source: "env" | "binary" } | null {
  const overrideVersion = String(env.CHROMEDRIVER_VERSION || env.CHROME_VERSION || "").trim()
  if (overrideVersion) {
    return {
      chromePath: env.CHROME_PATH || env.CHROME_BINARY || env.CHROME_EXE || null,
      version: overrideVersion,
      source: "env"
    }
  }

  const chromePath = resolveChromeBinaryPath({ env, platform, fsImpl, execFileSyncImpl })
  if (!chromePath) return null
  if (platform !== "win32") return null

  const version = readWindowsFileVersion(chromePath, execFileSyncImpl)
  if (!version) return null
  return { chromePath, version, source: "binary" }
}

export function resolveChromeDriverRelease(
  chromeVersion: string,
  versions: ChromeForTestingVersion[]
): ChromeForTestingVersion | null {
  if (!chromeVersion || !Array.isArray(versions) || versions.length === 0) {
    return null
  }
  const normalized = String(chromeVersion).trim()
  const exact = versions.find((entry) => entry.version === normalized)
  if (exact) return exact

  const major = normalized.split(".")[0]
  const sameMajor = versions.filter(
    (entry) => typeof entry.version === "string" && entry.version.startsWith(`${major}.`)
  )
  return sameMajor.length ? sameMajor[sameMajor.length - 1] : null
}
