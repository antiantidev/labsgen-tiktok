const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { resolveChromeDriverRelease, resolveChromeVersion } = require("./chromeDriver");

test("resolveChromeDriverRelease picks the latest matching major release", () => {
  const versions = [
    { version: "145.0.7600.1" },
    { version: "146.0.7680.100" },
    { version: "146.0.7680.154" }
  ];

  const exact = resolveChromeDriverRelease("146.0.7680.154", versions);
  assert.equal(exact.version, "146.0.7680.154");

  const fallback = resolveChromeDriverRelease("146.0.9999.1", versions);
  assert.equal(fallback.version, "146.0.7680.154");
});

test("resolveChromeVersion uses env override when present", () => {
  const chrome = resolveChromeVersion({
    env: { CHROME_VERSION: "146.0.7680.154" }
  });

  assert.equal(chrome.version, "146.0.7680.154");
  assert.equal(chrome.source, "env");
});

test("resolveChromeVersion reads the chrome binary version", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "labsgen-chrome-"));
  const chromeExe = path.join(tmp, "chrome.exe");
  fs.writeFileSync(chromeExe, "");

  const chrome = resolveChromeVersion({
    env: { CHROME_PATH: chromeExe },
    fsImpl: { existsSync: (candidate) => candidate === chromeExe },
    execFileSyncImpl: (file, args) => {
      if (file === "powershell.exe") {
        assert.deepEqual(args[0], "-NoProfile");
        assert.ok(args[2].includes("VersionInfo.ProductVersion"));
        return "146.0.7680.154";
      }

      assert.equal(file, chromeExe);
      assert.deepEqual(args, ["--version"]);
      return "Google Chrome 146.0.7680.154";
    }
  });

  assert.equal(chrome.chromePath, chromeExe);
  assert.equal(chrome.version, "146.0.7680.154");
  assert.equal(chrome.source, "binary");
});
