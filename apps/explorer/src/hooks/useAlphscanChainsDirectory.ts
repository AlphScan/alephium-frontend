import { useQuery } from '@tanstack/react-query'

import { getAlphscanAuthHeaders, getAlphscanRestBaseUrl } from '@/pages/AddressPage/alphscanContractUtils'

export type AlphscanChainListItem = {
  id: number
  avatar_url?: string | null
  icon?: string | null
  wormhole_id?: number | null
}

type ChainDirectory = {
  /** AlphScan `chain.id` → best logo URL */
  logoByChainId: Map<number, string>
  /** Wormhole wire chain id → best logo URL (for `wormhole_remote_pool.origin_wormhole_chain_id`) */
  logoByWormholeId: Map<number, string>
}

function pickLogoUrl(c: AlphscanChainListItem): string | null {
  const a = c.avatar_url?.trim()
  const i = c.icon?.trim()
  return a || i || null
}

async function fetchChainDirectory(base: string): Promise<ChainDirectory> {
  const res = await fetch(`${base}/chain/all?pageSize=-1`, { headers: getAlphscanAuthHeaders() })
  if (!res.ok) return { logoByChainId: new Map(), logoByWormholeId: new Map() }
  const data = (await res.json()) as { items?: AlphscanChainListItem[] }
  const items = Array.isArray(data.items) ? data.items : []
  const logoByChainId = new Map<number, string>()
  const logoByWormholeId = new Map<number, string>()
  for (const c of items) {
    const url = pickLogoUrl(c)
    if (!url) continue
    logoByChainId.set(c.id, url)
    const wh = c.wormhole_id
    if (wh != null && Number.isFinite(Number(wh))) {
      logoByWormholeId.set(Number(wh), url)
    }
  }
  return { logoByChainId, logoByWormholeId }
}

/** Logos for AlphScan chains (avatar_url / icon), including Wormhole id index for bridge rows. */
export function useAlphscanChainsDirectory() {
  const base = getAlphscanRestBaseUrl()
  return useQuery({
    queryKey: ['alphscan-chain-directory', base] as const,
    queryFn: () => fetchChainDirectory(base!),
    enabled: Boolean(base),
    staleTime: 24 * 60 * 60 * 1000,
  })
}
