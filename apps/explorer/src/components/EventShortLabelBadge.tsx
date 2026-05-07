import type { EventShortLabelBadgeVariant } from '@alphscan/normalized-events'
import { colord } from 'colord'
import styled, { useTheme } from 'styled-components'

import { resolveEventShortLabelAccent } from '@/config/eventShortLabelBadgeColors'
import { renderEventShortLabelIcon, renderCexEventIconEnhanced } from '@/config/eventShortLabelBadgeIcons'

const iconSize = 14

interface EventShortLabelBadgeProps {
  shortLabel: string
  variant: EventShortLabelBadgeVariant
  /** Optional category for enhanced icon rendering (e.g. for CEX-specific icons) */
  category?: string
  /** Optional sub-kind for enhanced icon rendering (e.g. for CEX-specific icons) */
  subKind?: string
}

const EventShortLabelBadge = ({ shortLabel, variant, category, subKind }: EventShortLabelBadgeProps) => {
  const theme = useTheme()
  const accent = resolveEventShortLabelAccent(theme, variant)
  const fill = colord(accent).alpha(0.1).toRgbString()

  // Use enhanced CEX icon rendering if category and subKind are provided
  const icon = (category && subKind) 
    ? renderCexEventIconEnhanced(category, subKind, { size: iconSize, color: accent })
    : renderEventShortLabelIcon(variant, { size: iconSize, color: accent })

  return (
    <Pill style={{ borderColor: accent, backgroundColor: fill, color: accent }}>
      {icon}
      <Label>{shortLabel}</Label>
    </Pill>
  )
}

export default EventShortLabelBadge

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
  max-width: 100%;
`

const Label = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
