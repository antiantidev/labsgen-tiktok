import crypto from "node:crypto"

type ExchangeCodeOptions = {
  timeoutMs?: number
  retries?: number
  onError?: ((meta: { status: number; body?: string; reason?: string }) => void) | null
  retryStatuses?: number[]
  retryDelayMs?: number
  headers?: Record<string, string>
}

type ExchangeCodeResponse = {
  success?: boolean
  data?: {
    oauth_token?: string
  }
}

export function createPkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(64).toString("hex")
  const hash = crypto.createHash("sha256").update(codeVerifier).digest()
  const codeChallenge = hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
  return { codeVerifier, codeChallenge }
}

export async function exchangeCode(
  code: string,
  codeVerifier: string,
  fetchImpl: typeof fetch = fetch,
  options: ExchangeCodeOptions = {}
): Promise<string | null> {
  const url = "https://streamlabs.com/api/v5/slobs/auth/data"
  const params = new URLSearchParams()
  params.set("code", code)
  params.set("code_verifier", codeVerifier)

  const timeoutMs = options.timeoutMs || 15000
  const retries = options.retries || 1
  const onError = options.onError || null
  const retryStatuses = options.retryStatuses || [401, 429, 500, 502, 503, 504]
  const retryDelayMs = options.retryDelayMs || 2000
  const headersOverride = options.headers || {}

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetchImpl(`${url}?${params.toString()}`, {
        method: "GET",
        headers: {
          "user-agent": "Labsgen Tiktok",
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          referer: "https://streamlabs.com/slobs/login",
          origin: "https://streamlabs.com",
          ...headersOverride
        },
        signal: controller.signal
      })

      if (!res.ok) {
        let body = ""
        try {
          body = await res.text()
        } catch {
          body = ""
        }
        if (onError) onError({ status: res.status, body: body.slice(0, 300) })
        if (retryStatuses.includes(res.status) && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
          continue
        }
        return null
      }

      let data: ExchangeCodeResponse | null = null
      try {
        data = (await res.json()) as ExchangeCodeResponse
      } catch {
        if (onError) onError({ status: res.status, reason: "invalid_json" })
        return null
      }

      if (data?.success && data.data?.oauth_token) {
        return data.data.oauth_token
      }
      if (onError) onError({ status: res.status, reason: "no_token" })
      return null
    } catch (err) {
      if (attempt >= retries) {
        throw err
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    } finally {
      clearTimeout(timer)
    }
  }

  return null
}
