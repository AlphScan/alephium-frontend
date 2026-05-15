import { addressFromContractId } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'

import { getAlphscanAuthHeaders, getAlphscanRestBaseUrl } from '@/pages/AddressPage/alphscanContractUtils'
import {
  type AlphscanNftRegistryKind,
  alphscanNftRegistryKindFromInterfaceId
} from '@/pages/AddressPage/alphscanNftInterface'
import type { AlphscanCollectionTraitDefRow, AlphscanNftTraitRow } from '@/pages/AddressPage/nftTraitDisplay'

export type AlphscanNftRow = {
  display_name?: string | null
  display_description?: string | null
  display_image?: string | null
  display_image_cdn_url?: string | null
  display_image_cdn_preview_url?: string | null
  collection_address?: string | null
  collection_display_name?: string | null
  nft_contract_address?: string
  token_uri_state?: string | null
  index_in_collection?: string | null
  owner_address?: string | null
  holding_contract_address?: string | null
  mint_tx?: string | null
  minter_address?: string | null
  dapp?: string | null
}

export type AlphscanCollectionRow = {
  collection_address?: string
  display_name?: string | null
  display_description?: string | null
  display_image?: string | null
  display_image_cdn_url?: string | null
  display_image_cdn_preview_url?: string | null
  collection_uri_state?: string | null
  dapp?: string | null
}

export type AlphscanNftRegistryPayload =
  | { kind: 'nft'; row: AlphscanNftRow | null; traits: AlphscanNftTraitRow[] }
  | {
      kind: 'nft_collection'
      row: AlphscanCollectionRow | null
      trait_definitions: AlphscanCollectionTraitDefRow[]
    }

export type { AlphscanCollectionTraitDefRow, AlphscanNftTraitRow }

export function pickNftDisplayImageUrl(
  row:
    | {
        display_image_cdn_url?: string | null
        display_image_cdn_preview_url?: string | null
        display_image?: string | null
      }
    | null
    | undefined
): string | undefined {
  if (!row) return undefined
  const full = row.display_image_cdn_url?.trim()
  const prev = row.display_image_cdn_preview_url?.trim()
  const raw = row.display_image?.trim()
  return full || prev || raw || undefined
}

async function fetchNftRegistryJson(
  base: string,
  address: string,
  kind: AlphscanNftRegistryKind
): Promise<AlphscanNftRegistryPayload | null> {
  const path =
    kind === 'nft'
      ? `${base}/nft/${encodeURIComponent(address)}/details`
      : `${base}/nft/collection/${encodeURIComponent(address)}/details`
  const res = await fetch(path, { headers: getAlphscanAuthHeaders() })
  if (res.status === 404) return null
  if (!res.ok) return null
  const data = (await res.json()) as Record<string, unknown>
  if (kind === 'nft') {
    return {
      kind: 'nft',
      row: (data.nft as AlphscanNftRow) ?? null,
      traits: Array.isArray(data.traits) ? (data.traits as AlphscanNftTraitRow[]) : []
    }
  }
  return {
    kind: 'nft_collection',
    row: (data.collection as AlphscanCollectionRow) ?? null,
    trait_definitions: Array.isArray(data.trait_definitions)
      ? (data.trait_definitions as AlphscanCollectionTraitDefRow[])
      : []
  }
}

/**
 * Lightweight hook for the NFT amounts column — fetches the Alphscan-enriched NFT row
 * (`display_name`, `display_image_cdn_preview_url`, etc.) for a single token id without
 * requiring a prior interface-id probe. Returns `null` when the token is not in the
 * Alphscan NFT registry (API 404) or when `tokenId` is empty.
 */
export function useAlphscanNftMeta(tokenId: string) {
  const base = getAlphscanRestBaseUrl()
  return useQuery({
    queryKey: ['alphscan-nft-meta', base, tokenId] as const,
    queryFn: async (): Promise<AlphscanNftRow | null> => {
      if (!base || !tokenId) return null
      // The API expects the base58 contract address, not the raw hex token ID
      const contractAddress = addressFromContractId(tokenId)
      const path = `${base}/nft/${encodeURIComponent(contractAddress)}/details`
      const res = await fetch(path, { headers: getAlphscanAuthHeaders() })
      if (!res.ok) return null
      const data = (await res.json()) as Record<string, unknown>
      return (data.nft as AlphscanNftRow) ?? null
    },
    enabled: Boolean(base && tokenId),
    staleTime: 5 * 60 * 1000
  })
}

/**
 * One Alphscan request, only when `interface_id` from contract details is NFT or NFTCollection*.
 * Does not probe both endpoints. Includes **traits** (NFT) or **trait_definitions** (collection) when the API returns them.
 */
export function useAlphscanNftRegistryRow(address: string, interfaceId: string | null | undefined) {
  const base = getAlphscanRestBaseUrl()
  const kind = alphscanNftRegistryKindFromInterfaceId(interfaceId)

  return useQuery({
    queryKey: ['alphscan-nft-registry', base, address, kind] as const,
    queryFn: async () => {
      if (!base || !kind) return null
      return fetchNftRegistryJson(base, address, kind)
    },
    enabled: Boolean(base && address && kind),
    staleTime: 5 * 60 * 1000
  })
}
