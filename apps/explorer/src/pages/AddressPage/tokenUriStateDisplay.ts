/**
 * Decode INFT `token_uri_state` / collection URI state (`data:application/json,...` or raw JSON) for display.
 */

export type TokenUriPrettifyResult = {
  text: string
  /** True when we parsed and re-stringified JSON (safe to show as monospace block). */
  isStructured: boolean
}

/**
 * Best-effort: decode `data:application/json,...` (URL-encoded payload), optional base64,
 * or parse raw JSON; otherwise return the original string.
 */
export function prettifyTokenUriState(raw: string | null | undefined): TokenUriPrettifyResult {
  const s = raw?.trim()
  if (!s) {
    return { text: '—', isStructured: false }
  }

  const tryPrettyJson = (jsonStr: string): TokenUriPrettifyResult | null => {
    try {
      const parsed = JSON.parse(jsonStr) as unknown
      return {
        text: JSON.stringify(parsed, null, 2),
        isStructured: true
      }
    } catch {
      return null
    }
  }

  const dataJson = /^data:application\/json(?:;[^\s,]*)?,(.*)$/is.exec(s)
  if (dataJson) {
    const rest = dataJson[1] ?? ''
    try {
      const decoded = decodeURIComponent(rest.replace(/\+/g, ' '))
      const pretty = tryPrettyJson(decoded)
      if (pretty) return pretty
      return { text: decoded, isStructured: false }
    } catch {
      const pretty = tryPrettyJson(rest)
      if (pretty) return pretty
    }
  }

  const dataB64 = /^data:application\/json[^,]*;base64,(.+)$/i.exec(s)
  if (dataB64) {
    try {
      const jsonStr = typeof atob === 'function' ? atob(dataB64[1]) : ''
      const pretty = tryPrettyJson(jsonStr)
      if (pretty) return pretty
    } catch {
      /* ignore */
    }
  }

  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    const pretty = tryPrettyJson(s)
    if (pretty) return pretty
  }

  return { text: s, isStructured: false }
}
