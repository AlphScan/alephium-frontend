import { type EventShortLabelBadgeVariant, EventShortLabelBadgeVariants } from '@alphscan/normalized-events'
import type { DefaultTheme } from 'styled-components'
import {
  resolveEventShortLabelAccentWithTheme as baseResolveEventShortLabelAccentWithTheme,
  EVENT_SHORT_LABEL_COLOR_OVERRIDES as BASE_COLOR_OVERRIDES
} from '@alphscan/sdk-react-ui'

/**
 * Explorer-specific color overrides for badge variants.
 * These override both the base SDK React UI defaults and the theme-based colors.
 */
export const EVENT_SHORT_LABEL_COLOR_OVERRIDES: Partial<Record<EventShortLabelBadgeVariant, string>> = {
  // Example explorer-specific overrides:
  // [EventShortLabelBadgeVariants.CONTRACT_CALL]: '#a78bfa',
  
  // You can add explorer-specific color overrides here
  ...BASE_COLOR_OVERRIDES, // Include any overrides from the base SDK
}

export function resolveEventShortLabelAccent(theme: DefaultTheme, variant: EventShortLabelBadgeVariant): string {
  // First check explorer-specific overrides
  const explorerOverride = EVENT_SHORT_LABEL_COLOR_OVERRIDES[variant]
  if (explorerOverride?.trim()) return explorerOverride.trim()
  
  // Use the base SDK React UI implementation with theme support
  return baseResolveEventShortLabelAccentWithTheme(variant, theme)
}
