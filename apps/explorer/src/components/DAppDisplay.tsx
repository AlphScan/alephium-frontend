import type { DappDetails } from '@alphscan/sdk'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { getAlphscanClient } from '@/api/addresses/addressAlphscanApi'

interface DAppDisplayProps {
  dappId: string
}

const DAppDisplay = ({ dappId }: DAppDisplayProps) => {
  const [dappDetails, setDappDetails] = useState<DappDetails | null>(() => getAlphscanClient().dapp.cache.peek(dappId))
  const [error, setError] = useState(false)

  useEffect(() => {
    const client = getAlphscanClient()
    const peeked = client.dapp.cache.peek(dappId)
    if (peeked) {
      setDappDetails(peeked)
      setError(false)
      return
    }

    setDappDetails(null)
    setError(false)
    let cancelled = false

    const load = async () => {
      try {
        const details = await client.dapp.cache.get(dappId)
        if (!cancelled) {
          setDappDetails(details)
          setError(!details)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setDappDetails(null)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [dappId])

  if (dappDetails) {
    const displayLabel = dappDetails.short_name?.trim() || dappDetails.name?.trim() || dappId
    const fullName = dappDetails.name?.trim()
    const titleHint = fullName && displayLabel !== fullName ? `${fullName} (${dappId})` : fullName || dappId

    return (
      <DappPill>
        {dappDetails.icon && (
          <DappIcon
            src={dappDetails.icon}
            alt={fullName || displayLabel}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <DappName title={titleHint}>{displayLabel}</DappName>
      </DappPill>
    )
  }

  if (error) {
    return <FallbackDappContainer title={dappId}>{dappId}</FallbackDappContainer>
  }

  return <DappPlaceholder aria-hidden />
}

export default DAppDisplay

const DappPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 160px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
`

const DappIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
`

const DappName = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DappPlaceholder = styled.span`
  display: inline-block;
  min-width: 100px;
  height: 20px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  opacity: 0.5;
`

const FallbackDappContainer = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.font.secondary};
  font-family: monospace;
`
