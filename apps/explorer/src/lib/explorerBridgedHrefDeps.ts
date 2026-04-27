import type { BridgedMappingHrefDeps } from '@alphscan/sdk-react-ui'

function trimBase(s: string | undefined, fallback: string): string {
  const t = s?.trim().replace(/\/$/, '') ?? ''
  return t || fallback
}

function ethBase(): string {
  return trimBase(import.meta.env.VITE_ETH_EXPLORER_URL as string | undefined, 'https://etherscan.io')
}

function bscBase(): string {
  return trimBase(import.meta.env.VITE_BSC_EXPLORER_URL as string | undefined, 'https://bscscan.com')
}

/** Explorer address route + public EVM explorers for bridged mapping links. */
export function explorerBridgedHrefDeps(): BridgedMappingHrefDeps {
  return {
    alephiumAddressUrl: (addr: string) => {
      const a = addr?.trim()
      if (!a) return null
      return `/addresses/${encodeURIComponent(a)}`
    },
    bridgedContractUrl: (chainId: number, contractAddress: string) => {
      const address = contractAddress?.trim()
      if (!address) return null
      if (chainId === 1) return `${ethBase()}/address/${encodeURIComponent(address)}`
      if (chainId === 56) return `${bscBase()}/address/${encodeURIComponent(address)}`
      return `/addresses/${encodeURIComponent(address)}`
    },
    wormholeOriginEvmTokenUrl: (wormholeChainId: number, evmAddress: string) => {
      const a = evmAddress.trim()
      if (!a) return null
      if (wormholeChainId === 2) return `${ethBase()}/token/${encodeURIComponent(a)}`
      if (wormholeChainId === 4) return `${bscBase()}/token/${encodeURIComponent(a)}`
      return null
    },
  }
}
