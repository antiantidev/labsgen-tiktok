const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const AUTH_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.17.0 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36";

async function retrieveCodeWithSelenium(authUrl, binaryPath, options = {}) {
  const optionsChrome = new chrome.Options();
  optionsChrome.addArguments(
    "--disable-blink-features=AutomationControlled",
    "--disable-infobars",
    "--start-maximized",
    `--user-agent=${AUTH_UA}`
  );
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

module.exports = { retrieveCodeWithSelenium };
