import { defaultResolveBridgedRowPrimaryHref } from '@alphscan/sdk-react-ui'
import { useMemo } from 'react'
import { RiExternalLinkLine } from 'react-icons/ri'
import styled from 'styled-components'

import { useAlphscanChainsDirectory } from '@/hooks/useAlphscanChainsDirectory'
import { useAlphscanTokenBridged } from '@/hooks/useAlphscanTokenBridged'
import { explorerBridgedHrefDeps } from '@/lib/explorerBridgedHrefDeps'
import {
  BridgedTokenChipLink,
  ChipChainLogo,
  ChipIdGradient,
  ChipLogoPlaceholder,
  ChipSymbol,
  ChipTrailingActions,
} from '@/pages/AddressPage/contractHeaderChipShared'
import type { AlphscanTokenBridgedMappingRow } from '@/types/alphscanTokenBridged'

const WORMHOLE_REMOTE_POOL = 'wormhole_remote_pool'

const hrefDepsSingleton = explorerBridgedHrefDeps()

function chainLogoUrl(
  row: Pick<AlphscanTokenBridgedMappingRow, 'mapping_kind' | 'chain_id' | 'origin_wormhole_chain_id'>,
  logoByChainId: Map<number, string>,
  logoByWormholeId: Map<number, string>,
  overrides?: Map<number, string>
): string | null {
  if (row.mapping_kind === WORMHOLE_REMOTE_POOL && row.origin_wormhole_chain_id != null) {
    const wh = row.origin_wormhole_chain_id
    return overrides?.get(wh) ?? logoByWormholeId.get(wh) ?? null
  }
  return logoByChainId.get(row.chain_id) ?? null
}

const ContractBridgedMappingTags = ({
  tokenIdHex,
  fallbackRows,
  chainLogoOverrides,
  fallbackSymbol,
}: {
  tokenIdHex: string
  fallbackRows?: AlphscanTokenBridgedMappingRow[]
  chainLogoOverrides?: Map<number, string>
  fallbackSymbol?: string | null
}) => {
  const { data, isPending, error } = useAlphscanTokenBridged(tokenIdHex)
  const { data: chainDir } = useAlphscanChainsDirectory()

  const { logoByChainId, logoByWormholeId } = useMemo(
    () =>
      chainDir ?? {
        logoByChainId: new Map<number, string>(),
        logoByWormholeId: new Map<number, string>(),
      },
    [chainDir]
  )

  const apiRows = data?.bridged ?? []
  const rows = apiRows.length > 0 ? apiRows : (fallbackRows ?? [])
  if (error && rows.length === 0) return null
  if (isPending && !data && rows.length === 0) return null
  if (rows.length === 0) return null

  const symbol =
    data?.token?.symbol?.trim() ||
    data?.token?.symbolOnChain?.trim() ||
    fallbackSymbol?.trim() ||
    null

  return (
    <TagsWrap>
      {rows.map((row) => {
        const href = defaultResolveBridgedRowPrimaryHref(row, hrefDepsSingleton)
        if (!href) return null
        const logo = chainLogoUrl(row, logoByChainId, logoByWormholeId, chainLogoOverrides)
        const contractId =
          row.mapping_kind === WORMHOLE_REMOTE_POOL
            ? (row.origin_evm_contract_address ?? row.contract_address).trim()
            : row.contract_address.trim()
        const contractDisplay = contractId || '—'

        return (
          <BridgedTokenChipLink key={row.id} href={href} target="_blank" rel="noopener noreferrer">
            {logo ? <ChipChainLogo src={logo} alt="" /> : <ChipLogoPlaceholder>?</ChipLogoPlaceholder>}
            <ChipSymbol>{symbol ?? '—'}</ChipSymbol>
            <ChipIdGradient>{contractDisplay}</ChipIdGradient>
            <ChipTrailingActions aria-hidden>
              <RiExternalLinkLine size={16} />
            </ChipTrailingActions>
          </BridgedTokenChipLink>
        )
      })}
    </TagsWrap>
  )
}

export default ContractBridgedMappingTags

const TagsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 0;
`
