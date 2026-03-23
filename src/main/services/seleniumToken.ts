import fs from "node:fs"
import path from "node:path"
import type { BrowserWindow } from "electron"
import { createPkce, exchangeCode } from "./oauth"

const { Builder } = require("selenium-webdriver") as { Builder: any }
const chrome = require("selenium-webdriver/chrome") as any

const AUTH_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.17.0 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36"

type RetrieveCodeOptions = {
  profilePath?: string
  driverPath?: string
  keepOpenOnError?: boolean
}

type LoadWebTokenOptions = {
  profilePath?: string
  driverPath?: string
}

function encodeRFC3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

export async function retrieveCodeWithSelenium(
  authUrl: string,
  binaryPath?: string | null,
  options: RetrieveCodeOptions = {}
): Promise<string | null> {
  const chromeOptions = new chrome.Options()
  chromeOptions.addArguments(
    "--disable-blink-features=AutomationControlled",
    "--disable-infobars",
    "--start-maximized",
    `--user-agent=${AUTH_UA}`
  )

  if (options.profilePath) {
    chromeOptions.addArguments(`--user-data-dir=${options.profilePath}`)
  }
  if (binaryPath) {
    chromeOptions.setChromeBinaryPath(binaryPath)
  }

  const localDriver = path.join(__dirname, "..", "..", "drivers", "chromedriver-win64", "chromedriver.exe")
  const driverPath = options.driverPath || localDriver
  const service =
    driverPath && fs.existsSync(driverPath) ? new chrome.ServiceBuilder(driverPath) : new chrome.ServiceBuilder()

  const driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).setChromeService(service).build()

  let success = false
  try {
    await driver.manage().setTimeouts({ implicit: 0, pageLoad: 600000, script: 600000 })
    await driver.get("https://www.tiktok.com/transparency")
    await driver.sleep(1000)
    await driver.get(authUrl)

    const startAt = Date.now()
    const timeoutMs = 10 * 60 * 1000
    while (Date.now() - startAt < timeoutMs) {
      const url = await driver.getCurrentUrl()
      if (url && url.includes("streamlabs.com")) {
        const parsed = new URL(url)
        let code = parsed.searchParams.get("code")
        if (!code && parsed.hash) {
          const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""))
          code = hashParams.get("code")
        }
        if (code) {
          success = true
          return code
        }
      }
      await driver.sleep(1000)
    }
    return null
  } catch (err) {
    if (options.keepOpenOnError) {
      await driver.sleep(30000)
    }
    throw err
  } finally {
    if (success || !options.keepOpenOnError) {
      await driver.quit()
    }
  }
}

export async function loadWebToken(
  _win: BrowserWindow | null,
  onStatus?: (status: string) => void,
  options: LoadWebTokenOptions = {}
): Promise<{ token: string | null; error?: string }> {
  try {
    if (onStatus) onStatus("Initializing secure capture...")
    const { codeVerifier, codeChallenge } = createPkce()
    const authUrl =
      "https://streamlabs.com/slobs/login?" +
      "skip_splash=true&external=electron&tiktok=&force_verify=&origin=slobs" +
      `&code_challenge=${encodeRFC3986(codeChallenge)}` +
      "&code_flow=true"

    if (onStatus) onStatus("Launching browser...")
    const code = await retrieveCodeWithSelenium(authUrl, undefined, {
      keepOpenOnError: true,
      profilePath: options.profilePath,
      driverPath: options.driverPath
    })

    if (!code) {
      return { token: null, error: "Failed to capture authentication code." }
    }

    if (onStatus) onStatus("Exchanging code for token...")
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const token = await exchangeCode(code, codeVerifier, fetch, {
      timeoutMs: 20000,
      retries: 2,
      retryStatuses: [401, 429, 500, 502, 503, 504],
      retryDelayMs: 2000,
      headers: {
        "user-agent": AUTH_UA
      }
    })

    if (!token) {
      return { token: null, error: "Failed to exchange code for token." }
    }

    return { token }
  } catch (err) {
    return { token: null, error: err instanceof Error ? err.message : String(err) }
  }
}
