import { useQuery } from '@tanstack/react-query'

import { getAlphscanAuthHeaders, getAlphscanRestBaseUrl } from '@/pages/AddressPage/alphscanContractUtils'

/** Public GET /addresses/{addr}/labels — same shape as AlphScan API. */
export type ExplorerAddressLabelRow = {
  address: string
  label: string
  source: string
  mapped_label?: string
  metadata?: {
    type?: string | null
    name?: string | null
    state?: string | null
    dapp?: string | null
    dapp_id?: string | null
    dapp_name?: string | null
    dapp_icon?: string | null
  } | null
  created_at?: string
  updated_at?: string
}

/** Labels from know-wallets / extra JSON — not generic token rows only. */
export function labelsLookLikeKnowWallet(labels: ExplorerAddressLabelRow[]): boolean {
  return labels.some((l) => {
    const s = l.source ?? ''
    return s.includes('know-wallets') || s.includes('alphscan:backend') || s.includes('github:sven-hash')
  })
}

async function fetchAddressLabels(address: string): Promise<ExplorerAddressLabelRow[]> {
  const base = getAlphscanRestBaseUrl()
  if (!base) return []
  const url = `${base.replace(/\/$/, '')}/addresses/${encodeURIComponent(address)}/labels`
  const res = await fetch(url, { headers: getAlphscanAuthHeaders() })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`Address labels ${res.status}`)
  const data = (await res.json()) as { labels?: ExplorerAddressLabelRow[] }
  return data.labels ?? []
}

/**
 * Direct `fetch` to AlphScan REST (`getAlphscanRestBaseUrl`) so DevTools always shows
 * `GET …/addresses/{addr}/labels` when configured — no AlphscanProvider / SDK client required.
 */
export function useExplorerAddressLabels(address: string, enabled: boolean) {
  const base = getAlphscanRestBaseUrl()
  return useQuery({
    queryKey: ['explorer-address-labels', base ?? '', address] as const,
    queryFn: () => fetchAddressLabels(address),
    enabled: Boolean(enabled && address.trim() && base),
    staleTime: 5 * 60 * 1000
  })
}
