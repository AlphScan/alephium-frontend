import type { BlockEntry } from '@alephium/web3/dist/src/api/api-explorer'
import { AlephiumTransactionWithAlphscan } from '@alphscan/sdk'
import { queryOptions } from '@tanstack/react-query'

import { getAlphscanClient } from '@/api/addresses/addressAlphscanApi'
import { isAlphscanExplorerProxyEnabled } from '@/api/alphscanExplorerRest'
import client from '@/api/client'

export type BlockEntryWithAlphscan = BlockEntry & {
  alphscan?: {
    genesis_mints?: unknown
    coinbases?: unknown
  }
}

const alphscanSource = () => (isAlphscanExplorerProxyEnabled() ? 'alphscan' : 'explorer')

export const blocksQueries = {
  block: {
    one: (blockHash: string) =>
      queryOptions({
        queryKey: ['block', blockHash, alphscanSource()] as const,
        queryFn: async (): Promise<BlockEntryWithAlphscan> => {
          if (isAlphscanExplorerProxyEnabled()) {
            const b = await getAlphscanClient().block.get(blockHash)
            return b as unknown as BlockEntryWithAlphscan
          }
          return client.explorer.blocks.getBlocksBlockHash(blockHash) as Promise<BlockEntryWithAlphscan>
        }
      }),
    uncle: (blockHash: string) =>
      queryOptions({
        queryKey: ['uncleBlock', blockHash],
        queryFn: () => client.node.blockflow.getBlockflowMainChainBlockByGhostUncleGhostUncleHash(blockHash)
      }),
    transactions: (blockHash: string, page: number = 1, limit = 20) =>
      queryOptions({
        queryKey: ['blockTransactions', blockHash, page, limit, alphscanSource()] as const,
        queryFn: async (): Promise<AlephiumTransactionWithAlphscan[]> => {
          if (isAlphscanExplorerProxyEnabled()) {
            return getAlphscanClient().block.transactions(blockHash, { page, limit })
          }
          return client.explorer.blocks.getBlocksBlockHashTransactions(blockHash, {
            page
          }) as Promise<AlephiumTransactionWithAlphscan[]>
        }
      })
  }
}
