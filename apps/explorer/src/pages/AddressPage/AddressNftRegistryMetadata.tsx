import { getAddressExplorerPagePath } from '@alephium/shared-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import ExternalLink from '@/components/ExternalLink'
import {
  type AlphscanCollectionRow,
  type AlphscanNftRow,
  pickNftDisplayImageUrl
} from '@/hooks/useAlphscanNftRegistryRow'
import type { AlphscanNftRegistryKind } from '@/pages/AddressPage/alphscanNftInterface'
import {
  type AlphscanCollectionTraitDefRow,
  type AlphscanNftTraitRow,
  formatNftTraitForDisplay
} from '@/pages/AddressPage/nftTraitDisplay'
import { prettifyTokenUriState } from '@/pages/AddressPage/tokenUriStateDisplay'
import { deviceBreakPoints } from '@/styles/globalStyles'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <MetaRow>
      <Label>{label}</Label>
      <Value>{children}</Value>
    </MetaRow>
  )
}

function Addr({ a }: { a: string | null | undefined }) {
  const t = a?.trim()
  if (!t) return <code>—</code>
  return (
    <AddrLink to={getAddressExplorerPagePath(t)} title={t}>
      {t}
    </AddrLink>
  )
}

function isAmountTraitKey(traitKey: string): boolean {
  return traitKey.trim().toLowerCase() === 'amount'
}

/** EX lock amount: env-driven logo + human amount + symbol (decimals already in value_text). */
function AmountExValue({ valueText }: { valueText: string }) {
  const raw = valueText.trim() || '—'
  const logo = (import.meta.env.VITE_EX_TOKEN_LOGO_URI as string | undefined)?.trim()
  const symbol = (import.meta.env.VITE_EX_TOKEN_SYMBOL as string | undefined)?.trim() || 'EX'
  return (
    <AmountExRow>
      {logo ? <ExLogo src={logo} alt="" /> : null}
      <AmountFigures>{raw}</AmountFigures>
      <ExSymbol>{symbol}</ExSymbol>
    </AmountExRow>
  )
}

function TokenUriValue({ raw }: { raw: string | null | undefined }) {
  const { text, isStructured } = prettifyTokenUriState(raw)
  if (text === '—') return <code>—</code>
  if (isStructured) return <JsonScrollPre>{text}</JsonScrollPre>
  return <Mono>{text}</Mono>
}

export default function AddressNftRegistryMetadata({
  kind,
  row,
  nftTraits,
  collectionTraitDefinitions
}: {
  kind: AlphscanNftRegistryKind
  row: AlphscanNftRow | AlphscanCollectionRow | null | undefined
  nftTraits?: AlphscanNftTraitRow[]
  collectionTraitDefinitions?: AlphscanCollectionTraitDefRow[]
}) {
  const { t } = useTranslation()
  const title = kind === 'nft_collection' ? t('Collection details') : t('NFT details')
  const img = pickNftDisplayImageUrl(row ?? undefined)

  if (!row) {
    return (
      <NftSectionWrap>
        <NftSectionTitle>{title}</NftSectionTitle>
        <NftCard>
          <Muted>{t('Indexed metadata')}: —</Muted>
        </NftCard>
      </NftSectionWrap>
    )
  }

  if (kind === 'nft_collection') {
    const c = row as AlphscanCollectionRow
    return (
      <NftSectionWrap>
        <NftSectionTitle>{title}</NftSectionTitle>
        <NftCard>
          <Inner>
            {img ? (
              <Thumb>
                <img src={img} alt="" />
              </Thumb>
            ) : null}
            <MainColumn>
              <Rows>
                <Row label="display_name">
                  <code>{c.display_name?.trim() || '—'}</code>
                </Row>
                <Row label="display_description">
                  <Pre>{c.display_description?.trim() || '—'}</Pre>
                </Row>
                <Row label="collection_address">
                  <Addr a={c.collection_address} />
                </Row>
                <Row label="collection_uri_state">
                  <TokenUriValue raw={c.collection_uri_state} />
                </Row>
                <Row label="display_image">
                  {c.display_image?.trim() ? (
                    <Ext href={c.display_image.trim()}>{c.display_image.trim()}</Ext>
                  ) : (
                    <code>—</code>
                  )}
                </Row>
              </Rows>
              {collectionTraitDefinitions && collectionTraitDefinitions.length > 0 ? (
                <TraitsBlock>
                  <TraitsHeading>{t('Trait catalog')}</TraitsHeading>
                  <TraitRows>
                    {collectionTraitDefinitions.map((def) => (
                      <MetaRow key={def.trait_key}>
                        <Label>{def.trait_key}</Label>
                        <Value>
                          <code>{def.definition_source?.trim() || '—'}</code>
                          {def.display_order != null ? <MutedOrder>{` · #${def.display_order}`}</MutedOrder> : null}
                        </Value>
                      </MetaRow>
                    ))}
                  </TraitRows>
                </TraitsBlock>
              ) : null}
            </MainColumn>
          </Inner>
        </NftCard>
      </NftSectionWrap>
    )
  }

  const n = row as AlphscanNftRow
  return (
    <NftSectionWrap>
      <NftSectionTitle>{title}</NftSectionTitle>
      <NftCard>
        <Inner>
          {img ? (
            <Thumb>
              <img src={img} alt="" />
            </Thumb>
          ) : null}
          <MainColumn>
            <Rows>
              <Row label="display_name">
                <code>{n.display_name?.trim() || '—'}</code>
              </Row>
              <Row label="display_description">
                <Pre>{n.display_description?.trim() || '—'}</Pre>
              </Row>
              <Row label="collection_address">
                <Addr a={n.collection_address} />
              </Row>
              <Row label="collection_display_name">
                <code>{n.collection_display_name?.trim() || '—'}</code>
              </Row>
              <Row label="index_in_collection">
                <code>{n.index_in_collection?.trim() ?? '—'}</code>
              </Row>
              <Row label="token_uri_state">
                <TokenUriValue raw={n.token_uri_state} />
              </Row>
              <Row label="owner_address">
                <Addr a={n.owner_address} />
              </Row>
              <Row label="mint_tx">
                {n.mint_tx?.trim() ? (
                  <AddrLink to={`/transactions/${n.mint_tx.trim()}`}>{n.mint_tx.trim()}</AddrLink>
                ) : (
                  <code>—</code>
                )}
              </Row>
            </Rows>
            {nftTraits && nftTraits.length > 0 ? (
              <TraitsBlock>
                <TraitsHeading>{t('Traits')}</TraitsHeading>
                <TraitRows>
                  {nftTraits.map((tr, idx) => {
                    const parts = formatNftTraitForDisplay(tr.trait_key, tr.value_text)
                    const amountUi = isAmountTraitKey(tr.trait_key) ? <AmountExValue valueText={tr.value_text} /> : null
                    return (
                      <MetaRow key={`${tr.trait_key}-${idx}`}>
                        <Label>{tr.trait_key}</Label>
                        <Value>
                          {amountUi ?? (
                            <>
                              <div>{parts.primary}</div>
                              {parts.rawTimestamp ? (
                                <TraitRaw title={t('Timestamp (raw)')}>
                                  {t('Timestamp (raw)')}: <code>{parts.rawTimestamp}</code>
                                </TraitRaw>
                              ) : null}
                            </>
                          )}
                        </Value>
                      </MetaRow>
                    )
                  })}
                </TraitRows>
              </TraitsBlock>
            ) : null}
          </MainColumn>
        </Inner>
      </NftCard>
    </NftSectionWrap>
  )
}

const NftSectionWrap = styled.div`
  margin-bottom: 24px;
`

const NftSectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
`

const NftCard = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const AmountExRow = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 500;
  color: ${({ theme }) => theme.font.primary};
`

const ExLogo = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background: ${({ theme }) => theme.bg.secondary};
`

const AmountFigures = styled.span`
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, Menlo, monospace;
`

const ExSymbol = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 600;
  letter-spacing: 0.02em;
`

const Inner = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  @media ${deviceBreakPoints.tablet} {
    flex-direction: column;
  }
`

/** Stacks metadata rows + traits so trait labels line up with `display_name` (to the right of the thumb). */
const MainColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Thumb = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.border.primary};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const Rows = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 200px) 1fr;
  gap: 10px;
  padding: 6px 8px;
  background: ${({ theme }) => theme.bg.secondary};
  border-radius: 6px;
  font-size: 0.85rem;
  @media ${deviceBreakPoints.mobile} {
    grid-template-columns: 1fr;
  }
`

const Label = styled.span`
  color: ${({ theme }) => theme.font.tertiary};
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.78rem;
`

const Value = styled.div`
  min-width: 0;
  word-break: break-word;
  code {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.82rem;
  }
`

const Mono = styled.span`
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.78rem;
  word-break: break-all;
`

const Pre = styled.div`
  white-space: pre-wrap;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.82rem;
  line-height: 1.4;
`

const JsonScrollPre = styled.pre`
  margin: 0;
  max-height: 280px;
  overflow: auto;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.76rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.font.primary};
  background: ${({ theme }) => theme.bg.secondary};
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.font.secondary};
  font-size: 0.9rem;
`

const AddrLink = styled(Link)`
  color: ${({ theme }) => theme.global.accent};
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.82rem;
  word-break: break-all;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const Ext = styled(ExternalLink)`
  color: ${({ theme }) => theme.global.accent};
  font-size: 0.82rem;
  word-break: break-all;
`

const TraitsBlock = styled.div`
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border.primary};
`

const TraitsHeading = styled.h4`
  margin: 0 0 10px;
  padding-left: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
`

const TraitRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const TraitRaw = styled.div`
  margin-top: 4px;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.font.secondary};
  code {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.78rem;
  }
`

const MutedOrder = styled.span`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 0.78rem;
`
