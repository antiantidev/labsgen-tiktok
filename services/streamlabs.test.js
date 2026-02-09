const test = require("node:test");
const assert = require("node:assert/strict");
const { StreamService } = require("./streamlabs");

function makeFetch(response) {
  return async () => response;
}

test("getInfo returns json when ok", async () => {
  const svc = new StreamService({
    fetchImpl: makeFetch({ ok: true, json: async () => ({ user: { username: "u" } }) })
  });
  svc.setToken("t");
  const info = await svc.getInfo();
  assert.equal(info.user.username, "u");
});

test("search trims to 25 chars", async () => {
  let urlSeen = "";
  const svc = new StreamService({
    fetchImpl: async (url) => {
      urlSeen = url;
      return { ok: true, json: async () => ({ categories: [] }) };
    }
  });
  svc.setToken("t");
  await svc.search("12345678901234567890123456789");
  assert.ok(urlSeen.includes("category=1234567890123456789012345"));
});

test("start returns nulls when missing data", async () => {
  const svc = new StreamService({
    fetchImpl: makeFetch({ ok: true, json: async () => ({}) })
  });
  svc.setToken("t");
  const result = await svc.start("a", "b", "0");
  assert.equal(result.streamUrl, null);
  assert.equal(result.streamKey, null);
});
