import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { getHumanReadableError } from '@alephium/shared'
import { isValidAddress, type SignTransferTxResult } from '@alephium/web3'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Buttons/Button'
import { useSnackbar } from '@/hooks/useSnackbar'
import {
  alphDecimalStringToAttoAlph,
  getConfiguredDonationAddress,
  networkIdFromExplorerEnv
} from '@/pages/AddressInfoPage/donationUtils'
import { deviceBreakPoints } from '@/styles/globalStyles'

const ALEPHIUM_WALLET_CHROME =
  'https://chrome.google.com/webstore/detail/alephium-extension-wallet/hcghjdbbg9e8lgeelncplcgfpbaeaejl'

const NativeTokenDonationPanel = () => {
  const { displaySnackbar } = useSnackbar()
  const donationRecipient = useMemo(() => getConfiguredDonationAddress(), [])
  const [amountAlph, setAmountAlph] = useState('404')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastTxId, setLastTxId] = useState<string | null>(null)

  const donate = useCallback(async () => {
    setError(null)
    setLastTxId(null)

    const to = donationRecipient.trim()
    if (!isValidAddress(to)) {
      setError('Donation recipient address is misconfigured or invalid')
      return
    }

    let attoAlph: bigint
    try {
      attoAlph = alphDecimalStringToAttoAlph(amountAlph)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid amount')
      return
    }

    if (attoAlph <= 0n) {
      setError('Amount must be greater than zero')
      return
    }

    setBusy(true)
    try {
      const wallet = await getDefaultAlephiumWallet()
      if (!wallet) {
        setError('Alephium wallet not found. Install the extension and reload this page.')
        return
      }

      const networkId = networkIdFromExplorerEnv()
      const account = await wallet.enable({
        networkId,
        onDisconnected: () => {}
      })

      const result = await wallet.signAndSubmitTransferTx({
        signerAddress: account.address,
        destinations: [
          {
            address: to,
            attoAlphAmount: attoAlph.toString()
          }
        ]
      })

      const txId = (result as SignTransferTxResult).txId
      setLastTxId(txId)
      displaySnackbar({ text: 'Donation submitted', type: 'info' })
    } catch (e) {
      const msg = getHumanReadableError(e, 'Donation failed')
      setError(msg)
      displaySnackbar({ text: msg, type: 'alert' })
    } finally {
      setBusy(false)
    }
  }, [amountAlph, donationRecipient, displaySnackbar])

  return (
    <DonationWrap>
      <DonationTitle>Donate ALPH</DonationTitle>
      <DonationHint>
        Opens the Alephium browser extension so you can review and sign a simple transfer to the configured recipient.
      </DonationHint>

      <Field>
        <RecipientLabel>Recipient address</RecipientLabel>
        <RecipientAddress title={donationRecipient}>{donationRecipient}</RecipientAddress>
      </Field>

      <Field>
        <Label htmlFor="donation-amount">Amount (ALPH)</Label>
        <Input
          id="donation-amount"
          name="donation-amount"
          type="text"
          inputMode="decimal"
          value={amountAlph}
          onChange={(e) => setAmountAlph(e.target.value)}
          autoComplete="off"
        />
      </Field>

      {error ? <ErrorText role="alert">{error}</ErrorText> : null}

      <Actions>
        <Button type="button" accent big onClick={() => void donate()} disabled={busy}>
          {busy ? 'Waiting for wallet…' : 'Donate'}
        </Button>
      </Actions>

      {lastTxId ? (
        <SuccessLine>
          Transaction: <TxLink to={`/transactions/${lastTxId}`}>{lastTxId}</TxLink>
        </SuccessLine>
      ) : null}

      <WalletHint>
        Need the wallet?{' '}
        <ExternalLink href={ALEPHIUM_WALLET_CHROME} target="_blank" rel="noopener noreferrer">
          Alephium extension (Chrome)
        </ExternalLink>
      </WalletHint>
    </DonationWrap>
  )
}

export default NativeTokenDonationPanel

const DonationWrap = styled.div`
  width: 100%;
  max-width: 560px;
  margin-top: 2rem;
  padding: 1.25rem 1rem 1.5rem;
  text-align: left;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};

  @media ${deviceBreakPoints.mobile} {
    max-width: 100%;
  }
`

const DonationTitle = styled.h2`
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
  text-align: center;
`

const DonationHint = styled.p`
  margin: 0 0 1.25rem;
  font-size: 0.85rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
`

const Field = styled.div`
  margin-bottom: 1rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.font.secondary};
`

const RecipientLabel = styled.div`
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.font.secondary};
`

const RecipientAddress = styled.div`
  box-sizing: border-box;
  padding: 0.55rem 0.65rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background: ${({ theme }) => theme.bg.tertiary};
  color: ${({ theme }) => theme.font.primary};
  font-size: 0.85rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.4;
  user-select: all;
`

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.65rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background: ${({ theme }) => theme.bg.secondary};
  color: ${({ theme }) => theme.font.primary};
  font-size: 0.9rem;
  font-family: inherit;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.global.accent};
    outline-offset: 1px;
  }
`

const ErrorText = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.global.alert};
`

const Actions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.25rem;
`

const SuccessLine = styled.p`
  margin: 1rem 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  word-break: break-all;
`

const TxLink = styled(Link)`
  color: ${({ theme }) => theme.global.accent};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const WalletHint = styled.p`
  margin: 1rem 0 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.font.tertiary};
  text-align: center;
`

const ExternalLink = styled.a`
  color: ${({ theme }) => theme.global.accent};
`
