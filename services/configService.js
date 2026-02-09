const fs = require("fs");

function loadConfig(path) {
  try {
    if (!fs.existsSync(path)) return {};
    const raw = fs.readFileSync(path, "utf8");
    return JSON.parse(raw);
  } catch (_err) {
    return {};
  }
}

function saveConfig(path, data) {
  const dir = require("path").dirname(path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}

module.exports = { loadConfig, saveConfig };
