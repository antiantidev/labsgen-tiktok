const crypto = require("crypto");

function createPkce() {
  const codeVerifier = crypto.randomBytes(64).toString("hex");
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = hash.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return { codeVerifier, codeChallenge };
}

async function exchangeCode(code, codeVerifier, fetchImpl = fetch, options = {}) {
  const url = "https://streamlabs.com/api/v5/slobs/auth/data";
  const params = new URLSearchParams();
  params.set("code", code);
  params.set("code_verifier", codeVerifier);

  const timeoutMs = options.timeoutMs || 15000;
  const retries = options.retries || 1;
  const onError = options.onError || null;
  const retryStatuses = options.retryStatuses || [401, 429, 500, 502, 503, 504];
  const retryDelayMs = options.retryDelayMs || 2000;
  const headersOverride = options.headers || {};

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${url}?${params.toString()}`, {
        method: "GET",
        headers: {
          "user-agent": "slgtsk",
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          referer: "https://streamlabs.com/slobs/login",
          origin: "https://streamlabs.com",
          ...headersOverride
        },
        signal: controller.signal
      });
      if (!res.ok) {
        let body = "";
        try {
          body = await res.text();
        } catch (_err) {
          body = "";
        }
        if (onError) onError({ status: res.status, body: body.slice(0, 300) });
        if (retryStatuses.includes(res.status) && attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelayMs));
          continue;
        }
        return null;
      }
      let data = null;
      try {
        data = await res.json();
      } catch (_err) {
        if (onError) onError({ status: res.status, reason: "invalid_json" });
        return null;
      }
      if (data && data.success && data.data && data.data.oauth_token) {
        return data.data.oauth_token;
      }
      if (onError) onError({ status: res.status, reason: "no_token" });
      return null;
    } catch (err) {
      if (attempt >= retries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, retryDelayMs));
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

module.exports = { createPkce, exchangeCode };
