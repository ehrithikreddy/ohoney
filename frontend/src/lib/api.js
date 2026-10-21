// Thin JSON client for the ohoney API. Errors come back as ApiError with a `code`
// the UI can act on (VALIDATION, CART_CHANGED, RATE_LIMITED, NETWORK, ...).

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(code, message, details = {}, status = 0) {
    super(message)
    this.code = code
    this.details = details
    this.status = status
  }
}

export async function postJSON(path, body, { idempotencyKey, timeoutMs = 15000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    throw new ApiError('NETWORK', 'We couldn’t reach our server. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }

  const data = await res.json().catch(() => null)
  if (res.ok) return data
  const err = data?.error ?? {}
  throw new ApiError(
    err.code || 'SERVER',
    err.message || 'Something went wrong on our side. Please try again in a minute.',
    err,
    res.status,
  )
}

// randomUUID needs a secure context (HTTPS); getRandomValues works everywhere.
export const newIdempotencyKey = () =>
  globalThis.crypto.randomUUID?.() ??
  Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')

/** GET that resolves to null on any failure, for optional data such as feature flags. */
export async function getJSONOrNull(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(8000) })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}
