import type { AlphscanContractRecord, ContractSummary } from '@alphscan/sdk-react'

/** API may include joined token metadata (website, etc.); optional on the SDK type. */
export type AlphscanContractRecordWithMeta = AlphscanContractRecord & {
  token_metadata?: Record<string, unknown>
}

export function contractRecordToSummary(c: AlphscanContractRecord): ContractSummary {
  return {
    address: c.address,
    contract_id: c.contract_id,
    parent_contract_id: c.parent_contract_id,
    parent_address: c.parent_address,
    level: c.level,
    n_childs: c.n_childs,
    dapp: c.dapp,
    dapp_name: c.dapp_name,
    dapp_logo_uri: c.dapp_logo_uri,
    contract_icon: c.contract_icon,
    display_logo_uri: c.display_logo_uri,
    interface_id: c.interface_id,
    contract_interface: c.contract_interface,
    contract_name: c.contract_name,
    minter: c.minter,
    mint_tx: c.mint_tx,
    mint_time: c.mint_time,
    last_upgrade_date: c.last_upgrade_date,
    last_upgrade_minter: c.last_upgrade_minter,
    created_at: c.created_at,
    updated_at: c.updated_at,
    token_name: c.token_name,
    token_symbol: c.token_symbol,
    token_logo_uri: c.token_logo_uri,
    token_lp_kind: c.token_lp_kind,
    lp_token0_logo_uri: c.lp_token0_logo_uri,
    lp_token1_logo_uri: c.lp_token1_logo_uri,
    nft_registry_display_name: c.nft_registry_display_name,
    nft_registry_logo_uri: c.nft_registry_logo_uri,
    dia_oracle_display: c.dia_oracle_display,
  }
}

export function getAlphscanContractApiSettings(): {
  apiUrl: string | undefined
  apiKey: string | undefined
  version: string | undefined
  dappLogosBase: string
} {
  return {
    apiUrl: import.meta.env.VITE_ALPHSCAN_API_URL || undefined,
    apiKey: import.meta.env.VITE_ALPHSCAN_API_KEY || undefined,
    version: import.meta.env.VITE_ALPHSCAN_API_STAGE || undefined,
    dappLogosBase: (import.meta.env.VITE_DAPP_LOGOS_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '',
  }
}

/**
 * REST base URL for Alphscan HTTP routes (`/contract/...`, `/nft/...`), same shape as `@alphscan/sdk-react`:
 * `VITE_ALPHSCAN_API_URL` + `VITE_ALPHSCAN_API_STAGE` → e.g. `https://api.alphscan.io/dev`.
 */
export function getAlphscanRestBaseUrl(): string | undefined {
  const { apiUrl, version } = getAlphscanContractApiSettings()
  if (!apiUrl) return undefined
  let u = apiUrl.replace(/\/$/, '')
  const v = version?.trim().replace(/^\/|\/$/g, '')
  const alreadyStaged = /\/(dev|prod)$/i.test(u)
  if (v && !alreadyStaged) u = `${u}/${v}`
  return u
}

/** Headers matching API Gateway expectations when a key is configured. */
export function getAlphscanAuthHeaders(): HeadersInit {
  const { apiKey } = getAlphscanContractApiSettings()
  if (!apiKey?.trim()) return {}
  return {
    'X-API-Key': apiKey,
    Authorization: `Bearer ${apiKey}`,
  }
}

/**
 * Base URL of this explorer web app for `@alphscan/sdk-react-ui` links (addresses, transactions).
 * This is not {@link import.meta.env.VITE_BACKEND_URL} (Explorer API). When unset, uses `window.location.origin`.
 */
export function getAlphscanExplorerWebBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_ALPHSCAN_EXPLORER_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return ''
}

export function tokenWebsiteFromRecord(c: AlphscanContractRecordWithMeta): string {
  const m = c.token_metadata
  if (!m || typeof m !== 'object') return ''
  const w = m.website
  return typeof w === 'string' ? w.trim() : ''
}
