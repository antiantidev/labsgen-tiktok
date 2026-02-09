const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");
const { createPkce, exchangeCode } = require("./oauth");

const AUTH_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.17.0 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36";

function encodeRFC3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

async function retrieveCodeWithSelenium(authUrl, binaryPath, options = {}) {
  const optionsChrome = new chrome.Options();
  optionsChrome.addArguments(
    "--disable-blink-features=AutomationControlled",
    "--disable-infobars",
    "--start-maximized",
    `--user-agent=${AUTH_UA}`
  );

  // Add support for persistent Chrome profiles
  if (options.profilePath) {
    optionsChrome.addArguments(`--user-data-dir=${options.profilePath}`);
    // If multiple accounts are used, we might need to specify profile directory inside user-data-dir
    // but usually, one folder per account is cleaner.
  }

  if (binaryPath) {
    optionsChrome.setChromeBinaryPath(binaryPath);
  }

  const localDriver = path.join(
    __dirname,
    "..",
    "drivers",
    "chromedriver-win64",
    "chromedriver.exe"
  );
  const service =
    fs.existsSync(localDriver)
      ? new chrome.ServiceBuilder(localDriver)
      : new chrome.ServiceBuilder();
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(optionsChrome)
    .setChromeService(service)
    .build();
  let success = false;
  try {
    await driver.manage().setTimeouts({ implicit: 0, pageLoad: 600000, script: 600000 });
    await driver.get("https://www.tiktok.com/transparency");
    await driver.sleep(1000);
    await driver.get(authUrl);

    const start = Date.now();
    const timeoutMs = 10 * 60 * 1000;
    while (Date.now() - start < timeoutMs) {
      const url = await driver.getCurrentUrl();
      if (url && url.includes("streamlabs.com")) {
        const parsed = new URL(url);
        let code = parsed.searchParams.get("code");
        if (!code && parsed.hash) {
          const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
          code = hashParams.get("code");
        }
        if (code) {
          success = true;
          return code;
        }
      }
      await driver.sleep(1000);
    }
    return null;
  } catch (err) {
    if (options.keepOpenOnError) {
      await driver.sleep(30000);
    }
    throw err;
  } finally {
    if (success || !options.keepOpenOnError) {
      await driver.quit();
    }
  }
}

async function loadWebToken(win, onStatus, options = {}) {
  try {
    if (onStatus) onStatus("Initializing secure capture...");
    const { codeVerifier, codeChallenge } = createPkce();
    
    // Use the robust authUrl from reference project
    const authUrl =
      "https://streamlabs.com/slobs/login?" +
      "skip_splash=true&external=electron&tiktok=&force_verify=&origin=slobs" +
      `&code_challenge=${encodeRFC3986(codeChallenge)}` +
      "&code_flow=true";

    if (onStatus) onStatus("Launching browser...");
    const code = await retrieveCodeWithSelenium(authUrl, null, { 
      keepOpenOnError: true,
      profilePath: options.profilePath
    });

    if (!code) {
      return { token: null, error: "Failed to capture authentication code." };
    }

    if (onStatus) onStatus("Exchanging code for token...");
    // Crucial: Wait for redirect to settle
    await new Promise((r) => setTimeout(r, 5000));

    const token = await exchangeCode(code, codeVerifier, fetch, {
      timeoutMs: 20000,
      retries: 2,
      retryStatuses: [401, 429, 500, 502, 503, 504],
      retryDelayMs: 2000,
      headers: {
        "user-agent": AUTH_UA
      }
    });

    if (!token) {
      return { token: null, error: "Failed to exchange code for token." };
    }

    return { token, error: null };
  } catch (err) {
    return { token: null, error: err.message };
  }
}

module.exports = { retrieveCodeWithSelenium, loadWebToken };
