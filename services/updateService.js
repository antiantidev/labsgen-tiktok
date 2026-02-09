const semver = require("semver");

async function checkUpdate(repo, currentVersion) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      method: "GET",
      headers: {
        "user-agent": "Labsgen Tiktok"
      }
    });
    if (!res.ok) return null;
    const release = await res.json();
    const latest = String(release.tag_name || "").replace(/^v/i, "");
    if (semver.valid(latest) && semver.gt(latest, currentVersion)) {
      return {
        current: currentVersion,
        latest,
        url: release.html_url,
        notes: release.body || ""
      };
    }
  } catch (_err) {
    return null;
  }
  return null;
}

module.exports = { checkUpdate };
