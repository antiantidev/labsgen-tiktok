class StreamService {
  constructor(options = {}) {
    this.token = "";
    this.streamId = null;
    this.fetchImpl = options.fetchImpl || fetch;
  }

  setToken(token) {
    this.token = token || "";
  }

  setStreamId(streamId) {
    this.streamId = streamId || null;
  }

  getStreamId() {
    return this.streamId;
  }

  headers() {
    return {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.17.0 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36",
      authorization: `Bearer ${this.token}`
    };
  }

  async getInfo() {
    if (!this.token) throw new Error("Missing token");
    const res = await this.fetchImpl("https://streamlabs.com/api/v5/slobs/tiktok/info", {
      method: "GET",
      headers: this.headers()
    });
    if (!res.ok) {
      throw new Error(`Failed to load account info (${res.status})`);
    }
    return res.json();
  }

  async search(query) {
    if (!this.token || !query) return [];
    const trimmed = query.slice(0, 25);
    const url = `https://streamlabs.com/api/v5/slobs/tiktok/info?category=${encodeURIComponent(
      trimmed
    )}`;
    const res = await this.fetchImpl(url, { method: "GET", headers: this.headers() });
    if (!res.ok) {
      throw new Error(`Game search failed (${res.status})`);
    }
    const info = await res.json();
    const categories = Array.isArray(info.categories) ? info.categories : [];
    categories.push({ full_name: "Other", game_mask_id: "" });
    return categories;
  }

  async start(title, category, audienceType) {
    if (!this.token) throw new Error("Missing token");
    const body = new FormData();
    body.set("title", title);
    body.set("device_platform", "win32");
    body.set("category", category);
    body.set("audience_type", audienceType || "0");

    const res = await this.fetchImpl(
      "https://streamlabs.com/api/v5/slobs/tiktok/stream/start",
      {
        method: "POST",
        headers: this.headers(),
        body
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to start stream (${res.status})`);
    }
    const data = await res.json();
    if (!data || !data.rtmp || !data.key) {
      return { streamUrl: null, streamKey: null, streamId: null };
    }
    this.streamId = data.id || null;
    return { streamUrl: data.rtmp, streamKey: data.key, streamId: this.streamId };
  }

  async end() {
    if (!this.token || !this.streamId) return false;
    const url = `https://streamlabs.com/api/v5/slobs/tiktok/stream/${this.streamId}/end`;
    const res = await this.fetchImpl(url, { method: "POST", headers: this.headers() });
    if (!res.ok) {
      throw new Error(`Failed to end stream (${res.status})`);
    }
    const data = await res.json();
    return Boolean(data && data.success);
  }
}

module.exports = { StreamService };
