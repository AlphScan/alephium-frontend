/** Mirrors AlphScan `GET /token/{tokenid}/details` bridged rows. */

export interface AlphscanTokenBridgedMappingRow {
  id: string
  native_token_id: string
  chain_id: number
  contract_address: string
  mapping_kind: string
  origin_wormhole_chain_id?: number | null
  origin_token_id_hex?: string | null
  alephium_contract_id_hex?: string | null
  external_asset_id?: string | null
  origin_evm_contract_address?: string | null
  wormhole_pool_decimals?: number | null
  origin_wormhole_chain_name?: string | null
  origin_token_explorer_url?: string | null
}

export interface AlphscanTokenDetailsResponse {
  token: {
    id?: string
    symbol?: string
    symbolOnChain?: string
  }
  bridged: AlphscanTokenBridgedMappingRow[]
}
