import test from "node:test"
import assert from "node:assert/strict"
import { StreamService } from "./streamlabs.ts"

function makeFetch(response: unknown): typeof fetch {
  return (async () => response) as typeof fetch
}

test("getInfo returns json when ok", async () => {
  const svc = new StreamService({
    fetchImpl: makeFetch({ ok: true, json: async () => ({ user: { username: "u" } }) })
  })
  svc.setToken("t")
  const info = await svc.getInfo()
  assert.equal(info.user?.username, "u")
})

test("search trims to 25 chars", async () => {
  let urlSeen = ""
  const svc = new StreamService({
    fetchImpl: (async (url) => {
      urlSeen = String(url)
      return { ok: true, json: async () => ({ categories: [] }) } as unknown as Response
    }) as typeof fetch
  })
  svc.setToken("t")
  await svc.search("12345678901234567890123456789")
  assert.ok(urlSeen.includes("category=1234567890123456789012345"))
})

test("start returns nulls when missing data", async () => {
  const svc = new StreamService({
    fetchImpl: makeFetch({ ok: true, json: async () => ({}) })
  })
  svc.setToken("t")
  const result = await svc.start("a", "b", "0")
  assert.equal(result.streamUrl, null)
  assert.equal(result.streamKey, null)
})
