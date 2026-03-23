import test from "node:test"
import assert from "node:assert/strict"
import { createPkce, exchangeCode } from "./oauth.ts"

test("createPkce returns verifier and challenge", () => {
  const { codeVerifier, codeChallenge } = createPkce()
  assert.ok(codeVerifier)
  assert.ok(codeChallenge)
  assert.equal(codeVerifier.length, 128)
  assert.ok(!codeChallenge.includes("="))
})

test("exchangeCode returns token on success", async () => {
  const token = await exchangeCode("code", "verifier", async () => ({
    ok: true,
    json: async () => ({ success: true, data: { oauth_token: "tok" } })
  }) as unknown as Response)
  assert.equal(token, "tok")
})

test("exchangeCode returns null on non-200", async () => {
  const token = await exchangeCode("code", "verifier", async () => ({
    ok: false,
    status: 400,
    text: async () => "",
    json: async () => ({})
  }) as unknown as Response)
  assert.equal(token, null)
})

test("exchangeCode returns null on invalid json", async () => {
  const token = await exchangeCode("code", "verifier", async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new Error("bad json")
    }
  }) as unknown as Response)
  assert.equal(token, null)
})

test("exchangeCode retries on fetch error", async () => {
  let calls = 0
  const token = await exchangeCode(
    "code",
    "verifier",
    async () => {
      calls += 1
      if (calls < 2) {
        throw new Error("UND_ERR_CONNECT_TIMEOUT")
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { oauth_token: "tok" } })
      } as unknown as Response
    },
    { retries: 1, timeoutMs: 1000 }
  )
  assert.equal(token, "tok")
})
