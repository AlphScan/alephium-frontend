import {
  TX_LIST_TIMESTAMP_FORMAT as BASE_TX_LIST_TIMESTAMP_FORMAT,
  EVENT_BADGE_CONFIG as BASE_EVENT_BADGE_CONFIG,
  CEX_EVENT_CONFIG as BASE_CEX_EVENT_CONFIG
} from '@alphscan/sdk-react-ui'

/**
 * Address transaction list: timestamp under the hash (dayjs format tokens).
 * Edit here to change date/time presentation (e.g. French-style `DD/MM/YYYY HH[h]mm[mn]ss[s]`).
 * Uses the base format from SDK React UI, but can be overridden for explorer-specific needs.
 */
export const TX_LIST_TIMESTAMP_FORMAT = BASE_TX_LIST_TIMESTAMP_FORMAT

/**
 * Explorer-specific event badge configuration.
 * Extends the base configuration from SDK React UI.
 */
export const EVENT_BADGE_CONFIG = {
  ...BASE_EVENT_BADGE_CONFIG,
  // Explorer-specific overrides can go here
  // iconSize: 16, // Example: larger icons for explorer
}

/**
 * Explorer-specific CEX event configuration.
 * Extends the base configuration from SDK React UI.
 */
export const CEX_EVENT_CONFIG = {
  ...BASE_CEX_EVENT_CONFIG,
  // Explorer-specific overrides can go here
  useSpecificIcons: true, // Enable specific CEX icons in explorer
}
