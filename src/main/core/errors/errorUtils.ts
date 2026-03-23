export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function serializeError(err: unknown): { error: string; code: string | null } {
  const maybeCode = err && typeof err === "object" && "code" in err ? (err as { code?: unknown }).code : null
  return {
    error: getErrorMessage(err),
    code: typeof maybeCode === "string" ? maybeCode : null
  }
}
