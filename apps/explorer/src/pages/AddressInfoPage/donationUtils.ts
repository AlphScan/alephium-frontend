import { type NetworkId, networkIds, ONE_ALPH } from '@alephium/web3'

/** Default recipient when `VITE_DONATION_ADDRESS` is unset. */
export const DEFAULT_DONATION_ADDRESS = '1GScff1aZBs3yw2vhNB7tij2eSzTrU9Tdx3CZzCgwZmrm'

export function getConfiguredDonationAddress(): string {
  const fromEnv = import.meta.env.VITE_DONATION_ADDRESS?.trim()
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_DONATION_ADDRESS
}

export function networkIdFromExplorerEnv(): NetworkId {
  const raw = (import.meta.env.VITE_NETWORK_TYPE ?? 'mainnet').toLowerCase()
  if ((networkIds as readonly string[]).includes(raw)) {
    return raw as NetworkId
  }
  return 'mainnet'
}

/**
 * Parse a decimal ALPH amount (e.g. `1`, `0.5`, `.25`) into attoAlph (18 decimals).
 */
export function alphDecimalStringToAttoAlph(input: string): bigint {
  const s = input.trim().replace(/^\+/, '')
  if (!s) {
    throw new Error('Enter an amount')
  }
  if (!/^\d*\.?\d+$/.test(s)) {
    throw new Error('Use digits and at most one decimal point')
  }

  let wholeStr: string
  let fracStr: string
  if (s.startsWith('.')) {
    wholeStr = '0'
    fracStr = s.slice(1)
  } else {
    const parts = s.split('.')
    wholeStr = parts[0] ?? '0'
    fracStr = parts[1] ?? ''
  }

  if (fracStr.length > 18) {
    throw new Error('At most 18 decimal places')
  }

  const whole = wholeStr === '' ? 0n : BigInt(wholeStr)
  const fracPadded = (fracStr + '0'.repeat(18)).slice(0, 18)
  const frac = fracPadded.length === 0 ? 0n : BigInt(fracPadded)

  return whole * ONE_ALPH + frac
}
