import type { TransactionWithAlphscanDetail } from '@alphscan/sdk'
import { queryOptions } from '@tanstack/react-query'

import { getAlphscanClient } from '@/api/addresses/addressAlphscanApi'
import { isAlphscanExplorerProxyEnabled } from '@/api/alphscanExplorerRest'
import client from '@/api/client'

const alphscanSource = () => (isAlphscanExplorerProxyEnabled() ? 'alphscan' : 'explorer')

export const transactionsQueries = {
  transaction: {
    one: (txHash: string) =>
      queryOptions({
        queryKey: ['transactions', txHash, alphscanSource()] as const,
        queryFn: async (): Promise<TransactionWithAlphscanDetail> => {
          if (isAlphscanExplorerProxyEnabled()) {
            return getAlphscanClient().tx(txHash).detail()
          }
          return client.explorer.transactions.getTransactionsTransactionHash(txHash) as Promise<TransactionWithAlphscanDetail>
        }
      })
  }
}
