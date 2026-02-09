const fs = require("fs");
const path = require("path");

function loadConfig(configPath) {
  try {
    if (!fs.existsSync(configPath)) return {};
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch (_err) {
    return {};
  }
}

function saveConfig(configPath, data) {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = { loadConfig, saveConfig };
