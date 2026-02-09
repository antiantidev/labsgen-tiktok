const test = require("node:test");
const assert = require("node:assert/strict");
const { createPkce, exchangeCode } = require("./oauth");

test("createPkce returns verifier and challenge", () => {
  const { codeVerifier, codeChallenge } = createPkce();
  assert.ok(codeVerifier);
  assert.ok(codeChallenge);
  assert.equal(codeVerifier.length, 128);
  assert.ok(!codeChallenge.includes("="));
});

test("exchangeCode returns token on success", async () => {
  const token = await exchangeCode("code", "verifier", async () => ({
    ok: true,
    json: async () => ({ success: true, data: { oauth_token: "tok" } })
  }));
  assert.equal(token, "tok");
});

test("exchangeCode returns null on non-200", async () => {
  const token = await exchangeCode("code", "verifier", async () => ({
    ok: false,
    json: async () => ({})
  }));
  assert.equal(token, null);
});

test("exchangeCode returns null on invalid json", async () => {
  const token = await exchangeCode("code", "verifier", async () => ({
    ok: true,
    json: async () => {
      throw new Error("bad json");
    }
  }));
  assert.equal(token, null);
});

test("exchangeCode retries on fetch error", async () => {
  let calls = 0;
  const token = await exchangeCode(
    "code",
    "verifier",
    async () => {
      calls += 1;
      if (calls < 2) {
        throw new Error("UND_ERR_CONNECT_TIMEOUT");
      }
      return { ok: true, json: async () => ({ success: true, data: { oauth_token: "tok" } }) };
    },
    { retries: 1, timeoutMs: 1000 }
  );
  assert.equal(token, "tok");
});
