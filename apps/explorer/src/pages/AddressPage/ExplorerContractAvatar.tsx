import type { ContractSummary } from '@alphscan/sdk-react'
import {
  AlphscanAssetLogo,
  isLpContractRow,
  isNftLikeContractRow,
  isStrictFungibleTokenIssuer,
} from '@alphscan/sdk-react-ui'

type Row = Pick<
  ContractSummary,
  | 'dapp'
  | 'dapp_name'
  | 'dapp_logo_uri'
  | 'contract_interface'
  | 'interface_id'
  | 'token_logo_uri'
  | 'contract_icon'
  | 'display_logo_uri'
  | 'token_lp_kind'
  | 'lp_token0_logo_uri'
  | 'lp_token1_logo_uri'
  | 'nft_registry_logo_uri'
  | 'dia_oracle_display'
>

interface ExplorerContractAvatarProps {
  row: Row
  size?: 'sm' | 'md' | 'nm' | 'lg'
  dappLocalLogoBaseUrl?: string
  /** When set (e.g. Alphscan NFT registry CDN URL), shown instead of token/dapp logos. */
  overrideTokenImageUrl?: string | null
}

const defaultDappBase = (import.meta.env.VITE_DAPP_LOGOS_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

/** LP / strict fungible token / dapp logo — matches Alphscan admin + hierarchy policy. */
const ExplorerContractAvatar = ({
  row,
  size = 'lg',
  dappLocalLogoBaseUrl = defaultDappBase,
  overrideTokenImageUrl,
}: ExplorerContractAvatarProps) => {
  const iface = (row.contract_interface ?? row.interface_id ?? '—').trim() || '—'
  const fb = iface !== '—' ? `${iface.slice(0, 1)}${iface.slice(1, 2) || '?'}` : 'C?'
  const dappId = row.dapp?.trim()
  const fullRow = row as ContractSummary

  const dia = fullRow.dia_oracle_display
  const diaTok = dia?.tokenLogoUri?.trim()
  const diaOra = dia?.oracleLogoUrl?.trim()
  if (diaTok || diaOra) {
    const badge = size === 'lg' ? 18 : size === 'md' ? 16 : 14
    return (
      <span style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
        {diaTok ? (
          <AlphscanAssetLogo
            variant="token"
            imageUrl={diaTok}
            fallbackChar={fb.slice(0, 1)}
            size={size}
            tokenClip="rounded"
          />
        ) : (
          <AlphscanAssetLogo variant="token" imageUrl={null} fallbackChar={fb.slice(0, 1)} size={size} />
        )}
        {diaOra ? (
          <img
            src={diaOra}
            alt=""
            width={badge}
            height={badge}
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--bg-primary, #0d1117)',
              background: 'var(--bg-primary, #0d1117)'
            }}
          />
        ) : null}
      </span>
    )
  }

  const override = overrideTokenImageUrl?.trim()
  const nftTile = Boolean(override) || isNftLikeContractRow(fullRow)
  const tokenClip = nftTile ? 'rounded' : undefined
  if (override) {
    return (
      <AlphscanAssetLogo
        variant="token"
        imageUrl={override}
        fallbackChar={fb.slice(0, 1)}
        size={size}
        tokenClip="rounded"
      />
    )
  }

  if (isLpContractRow(fullRow)) {
    return (
      <AlphscanAssetLogo
        variant="lp"
        token0Url={row.lp_token0_logo_uri}
        token1Url={row.lp_token1_logo_uri}
        fallbackChar={fb}
        size={size}
      />
    )
  }
  const regLogo = row.nft_registry_logo_uri?.trim()
  if (regLogo && isNftLikeContractRow(fullRow)) {
    return (
      <AlphscanAssetLogo
        variant="token"
        imageUrl={regLogo}
        fallbackChar={fb.slice(0, 1)}
        size={size}
        tokenClip="rounded"
      />
    )
  }
  const dappUrl = row.dapp_logo_uri?.trim() ?? ''
  const display = row.display_logo_uri?.trim() ?? ''
  const displayWhenBetterThanDapp = display && display !== dappUrl ? display : ''
  const poolOrTokenImg =
    displayWhenBetterThanDapp || row.contract_icon?.trim() || row.token_logo_uri?.trim()
  if (poolOrTokenImg) {
    return (
      <AlphscanAssetLogo
        variant="token"
        imageUrl={poolOrTokenImg}
        fallbackChar={fb.slice(0, 1)}
        size={size}
        tokenClip={tokenClip}
      />
    )
  }
  if (dappId) {
    const dappFb = dappId.slice(0, 1).toUpperCase()
    return (
      <AlphscanAssetLogo
        variant="dapp"
        dappLogoUri={row.dapp_logo_uri}
        dappId={dappId}
        localLogoBaseUrl={dappLocalLogoBaseUrl}
        fallbackChar={dappFb}
        size={size}
      />
    )
  }
  if (isStrictFungibleTokenIssuer(fullRow) && row.token_logo_uri?.trim()) {
    return (
      <AlphscanAssetLogo
        variant="token"
        imageUrl={row.token_logo_uri}
        fallbackChar={fb.slice(0, 1)}
        size={size}
        tokenClip={tokenClip}
      />
    )
  }
  if (row.token_logo_uri?.trim()) {
    return (
      <AlphscanAssetLogo
        variant="token"
        imageUrl={row.token_logo_uri}
        fallbackChar={fb.slice(0, 1)}
        size={size}
        tokenClip={tokenClip}
      />
    )
  }
  return (
    <AlphscanAssetLogo variant="token" imageUrl={null} fallbackChar={fb.slice(0, 1)} size={size} tokenClip={tokenClip} />
  )
}

export default ExplorerContractAvatar
