import { type AlphscanAddressLabel, pickWalletDisplayTitle } from '@alphscan/sdk-react'
import { PiCoinsFill } from 'react-icons/pi'
import styled from 'styled-components'

import type { ExplorerAddressLabelRow } from '@/hooks/useExplorerAddressLabels'

import Ellipsed from './Ellipsed'

function rowToAlphscanLabel(row: ExplorerAddressLabelRow): AlphscanAddressLabel {
  return {
    address: row.address,
    label: row.label,
    source: row.source,
    mapped_label: row.mapped_label,
    metadata: row.metadata ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function explorerLabelChipTitle(row: ExplorerAddressLabelRow): string {
  const t = pickWalletDisplayTitle([rowToAlphscanLabel(row)])
  if (t?.trim()) return t.trim()
  const raw = row.label?.trim() ?? ''
  if (raw.startsWith('name:')) return raw.slice('name:'.length).trim() || raw
  if (raw.startsWith('type:')) return raw.slice('type:'.length).trim() || raw
  if (raw.startsWith('dapp:')) return raw.slice('dapp:'.length).trim() || raw
  if (/^exchangename:/i.test(raw)) return raw.replace(/^exchangename:/i, '').trim() || raw
  const m = row.mapped_label?.trim()
  if (m && !m.startsWith('exchange:')) return m
  if (raw) return raw
  return row.source?.trim() || 'Label'
}

function trimmedIconString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const t = value.trim()
  return t || undefined
}

function chipIconUrl(row: ExplorerAddressLabelRow): string | undefined {
  const fromSlots = row.icon?.[0]?.url?.trim()
  if (fromSlots) return fromSlots
  return trimmedIconString(row.metadata?.dapp_icon) ?? undefined
}

/** Contract kind row from AlphScan (no CDN logo); show a standard glyph on the chip. */
function isFungibleTokenKindBadge(row: ExplorerAddressLabelRow): boolean {
  const raw = row.label?.trim().toLowerCase() ?? ''
  return raw === 'token:fungible'
}

function chipHasLeadingVisual(row: ExplorerAddressLabelRow): boolean {
  return Boolean(chipIconUrl(row) || isFungibleTokenKindBadge(row))
}

function sortExplorerLabels(rows: ExplorerAddressLabelRow[]): ExplorerAddressLabelRow[] {
  return [...rows].sort((a, b) => {
    const da = Number(a.display_order) || 0
    const db = Number(b.display_order) || 0
    if (da !== db) return da - db
    const la = a.label ?? ''
    const lb = b.label ?? ''
    if (la !== lb) return la < lb ? -1 : 1
    const sa = a.source ?? ''
    const sb = b.source ?? ''
    if (sa !== sb) return sa < sb ? -1 : 1
    return 0
  })
}

/** Same visible chip (e.g. multiple DB rows for one exchange). */
function dedupeKeyFromTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim()
}

function pickBetterLabelRow(a: ExplorerAddressLabelRow, b: ExplorerAddressLabelRow): ExplorerAddressLabelRow {
  const da = Number(a.display_order) || 0
  const db = Number(b.display_order) || 0
  if (da < db) return a
  if (db < da) return b
  const iconA = chipHasLeadingVisual(a)
  const iconB = chipHasLeadingVisual(b)
  if (iconA && !iconB) return a
  if (iconB && !iconA) return b
  return a
}

/** One row per distinct chip title; prefers lower display_order then row with icon. */
function dedupeLabelRowsForDisplay(sorted: ExplorerAddressLabelRow[]): ExplorerAddressLabelRow[] {
  const bestByKey = new Map<string, ExplorerAddressLabelRow>()
  for (const row of sorted) {
    const k = dedupeKeyFromTitle(explorerLabelChipTitle(row))
    const prev = bestByKey.get(k)
    bestByKey.set(k, prev ? pickBetterLabelRow(prev, row) : row)
  }
  const emitted = new Set<string>()
  const out: ExplorerAddressLabelRow[] = []
  for (const row of sorted) {
    const k = dedupeKeyFromTitle(explorerLabelChipTitle(row))
    if (emitted.has(k)) continue
    if (bestByKey.get(k) !== row) continue
    emitted.add(k)
    out.push(row)
  }
  return out
}

interface AddressExplorerLabelBadgesProps {
  labels: ExplorerAddressLabelRow[]
}

const AddressExplorerLabelBadges = ({ labels }: AddressExplorerLabelBadgesProps) => {
  if (labels.length === 0) return null
  const sorted = sortExplorerLabels(labels)
  const deduped = dedupeLabelRowsForDisplay(sorted)
  return (
    <Wrap>
      {deduped.map((row) => {
        const title = explorerLabelChipTitle(row)
        const icon = chipIconUrl(row)
        const showFungibleGlyph = !icon && isFungibleTokenKindBadge(row)
        const key = `${row.source}\0${row.label}\0${row.display_order ?? 0}`
        return (
          <Chip key={key}>
            {icon ? (
              <ThumbWrap>
                <Thumb src={icon} alt="" />
              </ThumbWrap>
            ) : showFungibleGlyph ? (
              <IconThumbWrap aria-hidden>
                <PiCoinsFill size={12} />
              </IconThumbWrap>
            ) : null}
            <Ellipsed text={title} />
          </Chip>
        )
      })}
    </Wrap>
  )
}

export default AddressExplorerLabelBadges

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 16px;
  max-width: 100%;
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 220px;
  padding: 4px 10px 4px 6px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  color: ${({ theme }) => theme.font.primary};
  font-size: 13px;
  font-weight: 500;
`

const ThumbWrap = styled.span`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background: ${({ theme }) => theme.bg.primary};
`

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const IconThumbWrap = styled.span`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.font.secondary};

  svg {
    display: block;
  }
`
