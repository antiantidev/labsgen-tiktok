import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  CHROME_CFT_MANIFEST_URL,
  downloadFile,
  extractZip,
  fetchJson,
  resolveChromeDriverRelease,
  resolveChromeVersion
} from "../src/main/services/chromeDriver.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, "..")
const DRIVERS_DIR = path.join(PROJECT_ROOT, "drivers")

type Manifest = {
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

async function main(): Promise<void> {
  if (!fs.existsSync(DRIVERS_DIR)) {
    fs.mkdirSync(DRIVERS_DIR, { recursive: true })
  }

  const chrome = resolveChromeVersion()
  if (!chrome?.version) {
    throw new Error("Google Chrome was not found. Install Chrome or set CHROME_PATH to your chrome.exe.")
  }

  const json = await fetchJson<Manifest>(CHROME_CFT_MANIFEST_URL)
  const versions = json.versions || []
  const match = resolveChromeDriverRelease(chrome.version, versions)

  if (!match) {
    throw new Error(`No matching ChromeDriver version for Chrome ${chrome.version}`)
  }

  const downloads = match.downloads?.chromedriver || []
  if (!downloads.length) {
    throw new Error("No chromedriver downloads found")
  }

  const win = downloads.find((item) => item.platform === "win64") || downloads[0]
  const zipPath = path.join(DRIVERS_DIR, "chromedriver.zip")
  await downloadFile(win.url, zipPath)

  extractZip(zipPath, DRIVERS_DIR)
  fs.unlinkSync(zipPath)

  console.log(`Detected Chrome ${chrome.version}`)
  console.log(`Chromedriver installed: ${win.url}`)
}

void main().catch((err) => {
  console.error(err)
  process.exit(1)
})
