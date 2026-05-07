import { type EventShortLabelBadgeVariant, EventShortLabelBadgeVariants } from '@alphscan/normalized-events'
import type { ReactNode } from 'react'
import {
  renderEventShortLabelIcon as baseRenderEventShortLabelIcon,
  renderCexEventIcon,
  ContractCallCubeIcon as BaseContractCallCubeIcon,
  type EventShortLabelIconProps
} from '@alphscan/sdk-react-ui'

// Re-export the interface from SDK React UI
export type { EventShortLabelIconProps } from '@alphscan/sdk-react-ui'

/** Isometric "3D" cube for contract-call badges — tweak SVG here. */
export function ContractCallCubeIcon({ size, color }: EventShortLabelIconProps) {
  // Use the base implementation from SDK React UI
  return <BaseContractCallCubeIcon size={size} color={color} />
}

/**
 * Per-variant icon with explorer-specific overrides.
 * Uses SDK React UI defaults and adds specific customizations for the explorer.
 */
export function renderEventShortLabelIcon(
  variant: EventShortLabelBadgeVariant,
  props: EventShortLabelIconProps
): ReactNode {
  // Explorer-specific icon overrides can go here
  switch (variant) {
    case EventShortLabelBadgeVariants.CONTRACT_CALL:
      // Use the custom 3D cube for contract calls in explorer
      return <ContractCallCubeIcon {...props} />
    default:
      // Use the base implementation from SDK React UI for all other variants
      return baseRenderEventShortLabelIcon(variant, props)
  }
}

/**
 * Enhanced CEX event rendering with support for specific sub-kinds.
 * This allows the explorer to show specific icons for deposit, withdraw, and consolidate.
 */
export function renderCexEventIconEnhanced(
  category: string,
  subKind: string,
  props: EventShortLabelIconProps
): ReactNode {
  if (category === 'cex') {
    return renderCexEventIcon(subKind, props)
  }
  
  // For transfer events involving CEX, also use specific icons
  if (category === 'transfer') {
    switch (subKind) {
      case 'send_to_cex':
        return renderCexEventIcon('withdraw', props) // Money going to CEX (like withdraw from user perspective)
      case 'received_from_cex':
        return renderCexEventIcon('deposit', props) // Money coming from CEX (like deposit to user perspective)
    }
  }
  
  // Fallback to regular variant-based rendering
  const variant = category === 'cex' ? EventShortLabelBadgeVariants.CEX : EventShortLabelBadgeVariants.TRANSFER
  return renderEventShortLabelIcon(variant, props)
}