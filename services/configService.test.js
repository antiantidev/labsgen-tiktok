const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { loadConfig, saveConfig } = require("./configService");

test("saveConfig writes and loadConfig reads", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "slgtsk-"));
  const file = path.join(dir, "config.json");
  saveConfig(file, { token: "abc", audience_type: "1" });
  const data = loadConfig(file);
  assert.equal(data.token, "abc");
  assert.equal(data.audience_type, "1");
});

test("loadConfig returns empty when missing", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "slgtsk-"));
  const file = path.join(dir, "missing.json");
  const data = loadConfig(file);
  assert.deepEqual(data, {});
});
