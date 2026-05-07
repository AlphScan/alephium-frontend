import { colord } from 'colord'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import styled from 'styled-components'

interface LegacyTxTypeBadgeProps {
  label: string
  Icon?: IconType
  /** When set (e.g. pending spinner), overrides `Icon`. */
  leadingSlot?: ReactNode
  accentColor: string
  iconSize?: number
}

/** Outline pill for txs without Alphscan (category, sub_kind). */
const LegacyTxTypeBadge = ({ label, Icon, leadingSlot, accentColor, iconSize = 14 }: LegacyTxTypeBadgeProps) => {
  const fill = colord(accentColor).alpha(0.1).toRgbString()
  const leading = leadingSlot ?? (Icon ? <Icon size={iconSize} color={accentColor} /> : null)
  return (
    <Pill style={{ borderColor: accentColor, backgroundColor: fill, color: accentColor }}>
      {leading}
      <Label>{label}</Label>
    </Pill>
  )
}

export default LegacyTxTypeBadge

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
`

const Label = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
