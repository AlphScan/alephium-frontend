import { AlephiumTransactionWithAlphscan, alphscan, type AlphscanClientApi } from '@alphscan/sdk'
import { queryOptions } from '@tanstack/react-query'

/** One client per tab so `dapp.cache` stays warm between tx list prefetch and row renders. */
let alphscanClientSingleton: AlphscanClientApi | null = null

const getAlphscanClient = (): AlphscanClientApi => {
  if (!alphscanClientSingleton) {
    alphscanClientSingleton = alphscan({
      apiUrl: import.meta.env.VITE_ALPHSCAN_API_URL,
      apiKey: import.meta.env.VITE_ALPHSCAN_API_KEY,
      version: import.meta.env.VITE_ALPHSCAN_API_STAGE || undefined
    })
  }
  return alphscanClientSingleton
}

async function prefetchDappsForTransactions(
  txs: AlephiumTransactionWithAlphscan[],
  client: AlphscanClientApi
): Promise<void> {
  const ids = [
    ...new Set(
      txs.map((t) => t.alphscan?.dapp_id).filter((id): id is string => typeof id === 'string' && id.length > 0)
    )
  ]
  if (ids.length === 0) return
  await Promise.all(ids.map((id) => client.dapp.cache.get(id)))
}

export const addressAlphscanQueries = {
  transactions: (addressHash: string, pageNumber: number, limit = 10) =>
    queryOptions({
      queryKey: ['addressAlphscanTransactions', addressHash, pageNumber, limit],
      queryFn: async (): Promise<AlephiumTransactionWithAlphscan[]> => {
        const client = getAlphscanClient()
        const txs = await client.address.transactions(addressHash, {
          page: pageNumber,
          limit
        })
        await prefetchDappsForTransactions(txs, client)
        return txs
      }
    })
}

export { getAlphscanClient }
