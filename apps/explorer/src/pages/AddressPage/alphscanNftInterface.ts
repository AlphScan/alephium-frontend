/**
 * Maps Alphscan `contract.interface_id` (from GET /contract/{address}/details) to NFT registry endpoints.
 * Values seen in the wild: "NFT", "NFTCollection", "NFTCollectionWithRoyalty", "fungible", "FungibleToken", …
 */
export type AlphscanNftRegistryKind = 'nft' | 'nft_collection'

export function alphscanNftRegistryKindFromInterfaceId(
  interfaceId: string | null | undefined
): AlphscanNftRegistryKind | null {
  const raw = interfaceId?.trim()
  if (!raw) return null
  const n = raw.replace(/\s+/g, '').toLowerCase()
  if (n === 'nft') return 'nft'
  if (n === 'nftcollection' || n === 'nftcollectionwithroyalty') return 'nft_collection'
  return null
}

/** True for AlphScan `contract.interface_id` fungible token contracts (incl. Wormhole pools). */
export function isAlphscanFungibleInterfaceId(v: string | null | undefined): boolean {
  if (v == null || typeof v !== 'string') return false
  const n = v.trim().toLowerCase()
  return n === 'fungible' || n === 'fungibletoken'
}
