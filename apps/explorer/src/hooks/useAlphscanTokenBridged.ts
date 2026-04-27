import { useQuery } from '@tanstack/react-query'

import { getAlphscanAuthHeaders, getAlphscanRestBaseUrl } from '@/pages/AddressPage/alphscanContractUtils'
import type { AlphscanTokenDetailsResponse } from '@/types/alphscanTokenBridged'

async function fetchTokenDetailsWithBridged(
  base: string,
  tokenIdHex: string
): Promise<AlphscanTokenDetailsResponse> {
  const url = `${base}/token/${encodeURIComponent(tokenIdHex)}/details`
  const res = await fetch(url, { headers: getAlphscanAuthHeaders() })
  if (res.status === 404) {
    return { token: {}, bridged: [] }
  }
  if (!res.ok) {
    throw new Error(`AlphScan token details: ${res.status}`)
  }
  const body = (await res.json()) as AlphscanTokenDetailsResponse
  return {
    token: body.token ?? {},
    bridged: body.bridged ?? [],
  }
}

/** Token details + bridged mappings in one request. */
export function useAlphscanTokenBridged(tokenIdHex: string | null) {
  const base = getAlphscanRestBaseUrl()
  const id = tokenIdHex?.trim() || null
  return useQuery({
    queryKey: ['alphscan-token-details', base, id] as const,
    queryFn: () => fetchTokenDetailsWithBridged(base!, id!),
    enabled: Boolean(base && id),
    staleTime: 60_000,
  })
}
