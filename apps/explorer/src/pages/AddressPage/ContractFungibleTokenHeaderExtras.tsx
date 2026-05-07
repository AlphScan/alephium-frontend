import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import HighlightedHash from '@/components/HighlightedHash'
import { ReactComponent as AlephiumLogo } from '@/images/alephium_logo_monochrome.svg'
import { useAlphscanTokenBridged } from '@/hooks/useAlphscanTokenBridged'
import ContractBridgedMappingTags from '@/pages/AddressPage/ContractBridgedMappingTags'
import { ChipSymbol, NativeTokenChipShell } from '@/pages/AddressPage/contractHeaderChipShared'
import type { WormholeContractMeta } from '@/pages/AddressPage/alphscanContractUtils'
import type { AlphscanTokenBridgedMappingRow } from '@/types/alphscanTokenBridged'

function buildWormholeFallbackRow(
  tokenIdHex: string,
  contractAddress: string,
  wm: WormholeContractMeta
): AlphscanTokenBridgedMappingRow | null {
  const explorerUrl = wm.remoteTokenExplorerUrl?.trim() || null
  if (!explorerUrl) return null

  const wormholeChainId = typeof wm.wormholeId === 'number' ? wm.wormholeId : null

  const bridgeHex = wm.bridgeTokenIdHex?.replace(/^0x/i, '').toLowerCase() ?? ''
  const evmAddress =
    bridgeHex.length === 64 && bridgeHex.startsWith('000000000000000000000000')
      ? `0x${bridgeHex.slice(24)}`
      : bridgeHex.length === 40
        ? `0x${bridgeHex}`
        : null

  return {
    id: `synthetic:${tokenIdHex}:wormhole`,
    native_token_id: tokenIdHex,
    chain_id: 8738,
    contract_address: contractAddress,
    mapping_kind: 'wormhole_remote_pool',
    origin_wormhole_chain_id: wormholeChainId,
    origin_evm_contract_address: evmAddress,
    origin_token_explorer_url: explorerUrl,
    origin_wormhole_chain_name: wm.remoteChainName?.trim() || null,
    wormhole_pool_decimals: null,
  }
}

/** Below contract address: optional creation tx → token logo + symbol + token id → bridged tags. */
const ContractFungibleTokenHeaderExtras = ({
  tokenIdHex,
  creationTxHash,
  symbolOverride,
  wormholeMeta,
  contractAddress,
}: {
  tokenIdHex: string
  creationTxHash?: string
  symbolOverride?: string | null
  wormholeMeta?: WormholeContractMeta
  contractAddress?: string
}) => {
  const { t } = useTranslation()
  const { data } = useAlphscanTokenBridged(tokenIdHex)
  const symbol =
    symbolOverride?.trim() || data?.token?.symbol?.trim() || data?.token?.symbolOnChain?.trim() || null

  const { fallbackRows, chainLogoOverrides, fallbackSymbol } = useMemo(() => {
    if (!wormholeMeta || !contractAddress) {
      return { fallbackRows: undefined, chainLogoOverrides: undefined, fallbackSymbol: undefined }
    }
    const row = buildWormholeFallbackRow(tokenIdHex, contractAddress, wormholeMeta)
    const overrides = new Map<number, string>()
    if (
      typeof wormholeMeta.wormholeId === 'number' &&
      wormholeMeta.chainLogoUrl?.trim()
    ) {
      overrides.set(wormholeMeta.wormholeId, wormholeMeta.chainLogoUrl.trim())
    }
    return {
      fallbackRows: row ? [row] : undefined,
      chainLogoOverrides: overrides.size > 0 ? overrides : undefined,
      fallbackSymbol: wormholeMeta.symbol?.trim() || undefined,
    }
  }, [tokenIdHex, contractAddress, wormholeMeta])

  return (
    <ExtrasWrap>
      {creationTxHash ? (
        <MintRow>
          <MintLabel>{t('Creation transaction')}</MintLabel>
          <MintTxLink to={`/transactions/${creationTxHash}`}>
            <HighlightedHash text={creationTxHash} textToCopy={creationTxHash} />
          </MintTxLink>
        </MintRow>
      ) : null}
      <NativeTokenChipShell>
        <AlephLogoSlot>
          <AlephLogoFrame>
            <AlephiumLogo />
          </AlephLogoFrame>
        </AlephLogoSlot>
        <ChipSymbol>{symbol ?? '—'}</ChipSymbol>
        <TokenIdWrap>
          <TokenIdHighlighted text={tokenIdHex} textToCopy={tokenIdHex} fontSize={13} />
        </TokenIdWrap>
      </NativeTokenChipShell>
      <ContractBridgedMappingTags
        tokenIdHex={tokenIdHex}
        fallbackRows={fallbackRows}
        chainLogoOverrides={chainLogoOverrides}
        fallbackSymbol={fallbackSymbol}
      />
    </ExtrasWrap>
  )
}

export default ContractFungibleTokenHeaderExtras

const ExtrasWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  margin-bottom: 4px;
`

const MintRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.95rem;
`

const MintLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 500;
`

const MintTxLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const AlephLogoSlot = styled.div`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
`

const AlephLogoFrame = styled.div`
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  padding: 3px;
  background: linear-gradient(218.53deg, #0026ff 9.58%, #f840a5 86.74%);
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`

const TokenIdWrap = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
`

/** Keeps token id left; copy control pinned to the chip’s right edge (matches bridged row). */
const TokenIdHighlighted = styled(HighlightedHash)`
  width: 100%;
  min-width: 0;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;

  & > span:first-of-type {
    flex: 1 1 0;
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: break-all;
  }

  & > span:nth-of-type(2) {
    flex-shrink: 0;
  }

  & > div:last-of-type {
    margin-left: auto;
    flex-shrink: 0;
  }
`
