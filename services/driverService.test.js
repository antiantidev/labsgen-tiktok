const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { DriverService } = require("./driverService");

test("checkDriver returns false when Chrome is missing", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "labsgen-driver-"));
  const svc = new DriverService(process.cwd(), tmp);

  fs.mkdirSync(path.join(tmp, "drivers", "chromedriver-win64"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "drivers", "chromedriver-win64", "chromedriver.exe"), "");
  fs.writeFileSync(path.join(tmp, "drivers", "chromedriver.json"), JSON.stringify({
    chromeVersion: "146.0.7680.154",
    chromeMajor: "146",
    driverVersion: "146.0.7680.153"
  }));

  svc.chromeVersionResolver = () => null;

  const ready = await svc.checkDriver();
  assert.equal(ready, false);
});

test("setupDriver throws a structured error when Chrome is missing", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "labsgen-driver-"));
  const svc = new DriverService(process.cwd(), tmp);
  svc.chromeVersionResolver = () => null;
  svc.fetchJson = async () => {
    throw new Error("should not fetch manifest");
  };

  await assert.rejects(
    () => svc.setupDriver(),
    (err) => err.code === "CHROME_NOT_FOUND"
  );
});
