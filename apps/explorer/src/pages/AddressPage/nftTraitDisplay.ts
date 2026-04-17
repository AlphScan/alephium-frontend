/**
 * Display helpers for indexed NFT traits (e.g. Elexium veNFT `end` lock expiry as Unix timestamp).
 */

export type AlphscanNftTraitRow = {
  trait_key: string
  value_text: string
  value_numeric?: string | number | null
  value_bool?: boolean | null
}

export type AlphscanCollectionTraitDefRow = {
  trait_key: string
  definition_source?: string | null
  display_order?: number | null
  definition_meta?: unknown
}

const END_KEYS = new Set(['end', 'lock_end', 'expires', 'expiry', 'unlock', 'maturity'])

function isEndLikeTraitKey(key: string): boolean {
  const k = key.trim().toLowerCase()
  return END_KEYS.has(k) || k.endsWith('_end') || k.endsWith('_expiry')
}

/**
 * Elexium / Alephium veNFT lock end: stored integer is **seconds × 10_000** (fixed-point).
 * Divide by 10_000 to get Unix seconds, then convert to JS epoch ms for `Date`.
 */
function unixMsFromScaledSecondsTrait(raw: string): number | null {
  const s = raw.trim()
  if (!/^-?\d+$/.test(s)) return null
  try {
    const scaled = BigInt(s)
    const seconds = Number(scaled) / 10_000
    if (!Number.isFinite(seconds)) return null
    const ms = seconds * 1000
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : ms
  } catch {
    return null
  }
}

export type TraitValueParts = {
  /** Primary line(s) for the trait value */
  primary: string
  /** Extra line: raw timestamp integer */
  rawTimestamp?: string
}

/**
 * For timestamp-like traits (e.g. `end`), returns a locale date plus the raw chain value.
 * Other traits return a single primary string (bool / numeric / text).
 */
export function formatNftTraitForDisplay(traitKey: string, valueText: string): TraitValueParts {
  const key = traitKey.trim()
  const raw = valueText.trim()
  if (!raw) {
    return { primary: '—' }
  }

  if (isEndLikeTraitKey(key)) {
    const ms = unixMsFromScaledSecondsTrait(raw)
    if (ms != null) {
      const d = new Date(ms)
      return {
        primary: d.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'medium' }),
        rawTimestamp: raw
      }
    }
  }

  return { primary: raw }
}
