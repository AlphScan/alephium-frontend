import { getAlphscanContractApiSettings, getAlphscanRestBaseUrl } from '@/pages/AddressPage/alphscanContractUtils'

/**
 * When true, block and transaction views use Alphscan explorer proxies (`/block/...`, `/transaction/...`)
 * via `@alphscan/sdk` (same URL + key as address queries). Requires `VITE_ALPHSCAN_API_URL` and `VITE_ALPHSCAN_API_KEY`.
 */
export function isAlphscanExplorerProxyEnabled(): boolean {
  const base = getAlphscanRestBaseUrl()?.trim()
  const { apiKey } = getAlphscanContractApiSettings()
  return Boolean(base && apiKey?.trim())
}
