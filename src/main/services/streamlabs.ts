import type { StreamAccountInfo, StreamCategory, StreamStartResult } from "../../shared/ipc/contracts"

type StreamServiceOptions = {
  fetchImpl?: typeof fetch
}

type StreamInfoResponse = StreamAccountInfo & {
  categories?: StreamCategory[]
}

type StreamStartApiResponse = {
  id?: string | null
  rtmp?: string | null
  key?: string | null
}

export class StreamService {
  private token = ""
  private streamId: string | null = null
  private readonly fetchImpl: typeof fetch

  constructor(options: StreamServiceOptions = {}) {
    this.fetchImpl = options.fetchImpl || fetch
  }

  setToken(token: string): void {
    this.token = token || ""
  }

  setStreamId(streamId: string | null): void {
    this.streamId = streamId || null
  }

  getStreamId(): string | null {
    return this.streamId
  }

  private headers(): Record<string, string> {
    return {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.17.0 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36",
      authorization: `Bearer ${this.token}`
    }
  }

  async getInfo(): Promise<StreamAccountInfo> {
    if (!this.token) throw new Error("Missing token")
    const res = await this.fetchImpl("https://streamlabs.com/api/v5/slobs/tiktok/info", {
      method: "GET",
      headers: this.headers()
    })
    if (!res.ok) {
      throw new Error(`Failed to load account info (${res.status})`)
    }
    return (await res.json()) as StreamAccountInfo
  }

  async search(query = ""): Promise<StreamCategory[]> {
    if (!this.token) return []
    const trimmed = query.slice(0, 25)
    const url = trimmed
      ? `https://streamlabs.com/api/v5/slobs/tiktok/info?category=${encodeURIComponent(trimmed)}`
      : "https://streamlabs.com/api/v5/slobs/tiktok/info"

    const res = await this.fetchImpl(url, { method: "GET", headers: this.headers() })
    if (!res.ok) {
      throw new Error(`Game search failed (${res.status})`)
    }

    const info = (await res.json()) as StreamInfoResponse
    const categories = Array.isArray(info.categories) ? [...info.categories] : []
    if (categories.length > 0 && !categories.find((item) => item.full_name === "Other")) {
      categories.push({ full_name: "Other", game_mask_id: "" })
    }
    return categories
  }

  async start(title: string, category: string, audienceType: string): Promise<StreamStartResult> {
    if (!this.token) throw new Error("Missing token")
    const body = new FormData()
    body.set("title", title)
    body.set("device_platform", "win32")
    body.set("category", category)
    body.set("audience_type", audienceType || "0")

    const res = await this.fetchImpl("https://streamlabs.com/api/v5/slobs/tiktok/stream/start", {
      method: "POST",
      headers: this.headers(),
      body
    })
    if (!res.ok) {
      throw new Error(`Failed to start stream (${res.status})`)
    }

    const data = (await res.json()) as StreamStartApiResponse
    if (!data || !data.rtmp || !data.key) {
      return { streamUrl: null, streamKey: null, streamId: null }
    }

    this.streamId = data.id || null
    return {
      streamUrl: data.rtmp,
      streamKey: data.key,
      streamId: this.streamId
    }
  }

  async end(): Promise<boolean> {
    if (!this.token || !this.streamId) return false
    const url = `https://streamlabs.com/api/v5/slobs/tiktok/stream/${this.streamId}/end`
    const res = await this.fetchImpl(url, { method: "POST", headers: this.headers() })
    if (!res.ok) {
      throw new Error(`Failed to end stream (${res.status})`)
    }
    const data = (await res.json()) as { success?: unknown }
    return Boolean(data && data.success)
  }
}
