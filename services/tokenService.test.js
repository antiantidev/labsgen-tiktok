const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { TokenService } = require("./tokenService");

function makeWinDir(root) {
  const dir = path.join(root, "slobs-client", "Local Storage", "leveldb");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

test("loadLocalToken returns token from latest log", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "labsgen-tiktok-"));
  const dir = makeWinDir(tmp);
  const file1 = path.join(dir, "0001.log");
  const file2 = path.join(dir, "0002.log");
  fs.writeFileSync(file1, '"apiToken":"aaa111"');
  fs.writeFileSync(file2, '"apiToken":"bbb222"');
  const now = Date.now() / 1000;
  fs.utimesSync(file1, now - 10, now - 10);
  fs.utimesSync(file2, now, now);
  const svc = new TokenService({
    platform: "win32",
    env: { APPDATA: tmp }
  });
  const res = svc.loadLocalToken();
  assert.equal(res.token, "bbb222");
  assert.equal(res.error, null);
});

test("loadLocalToken returns error when unsupported OS", () => {
  const svc = new TokenService({ platform: "linux" });
  const res = svc.loadLocalToken();
  assert.equal(res.token, null);
  assert.ok(res.error.includes("Unsupported"));
});

test("loadLocalToken returns error when no files", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "labsgen-tiktok-"));
  makeWinDir(tmp);
  const svc = new TokenService({
    platform: "win32",
    env: { APPDATA: tmp }
  });
  const res = svc.loadLocalToken();
  assert.equal(res.token, null);
  assert.ok(res.error.includes("No API Token"));
});
