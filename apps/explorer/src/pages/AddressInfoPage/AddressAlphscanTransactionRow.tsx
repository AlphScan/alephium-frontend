import { isConfirmedTx, isSameBaseAddress } from '@alephium/shared'
import { isGrouplessAddressWithoutGroupIndex } from '@alephium/web3'
import type { MempoolTransaction, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { resolveEventShortLabel } from '@alphscan/normalized-events'
import { AlephiumTransactionWithAlphscan } from '@alphscan/sdk'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import type { IconType } from 'react-icons'
import { MdOutlineHourglassFull } from 'react-icons/md'
import { RiArrowRightLine } from 'react-icons/ri'
import styled, { css, useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import DAppDisplay from '@/components/DAppDisplay'
import EventShortLabelBadge from '@/components/EventShortLabelBadge'
import FailedTXBubble from '@/components/FailedTXBubble'
import LegacyTxTypeBadge from '@/components/LegacyTxTypeBadge'
import { AddressLink, TightLink } from '@/components/Links'
import LoadingSpinner from '@/components/LoadingSpinner'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '@/components/Table/TableDetailsRow'
import TableHeader from '@/components/Table/TableHeader'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import TransactionIOList from '@/components/TransactionIOList'
import { TX_LIST_TIMESTAMP_FORMAT } from '@/config/eventShortLabelBadgePresentation'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import { getTransactionUI } from '@/hooks/useTransactionUI'
import { useTransactionInfo } from '@/utils/transactions'

interface AddressAlphscanTransactionRowProps {
  transaction: AlephiumTransactionWithAlphscan
  addressHash: string
  isInContract: boolean
}

const directionIconSize = 14

const AddressAlphscanTransactionRow = ({
  transaction: tx,
  addressHash,
  isInContract
}: AddressAlphscanTransactionRowProps) => {
  const { t } = useTranslation()
  const { detailOpen, toggleDetail } = useTableDetailsState(false)
  const theme = useTheme()

  const txExplorer = tx as unknown as Transaction | MempoolTransaction
  const { assets, infoType, direction } = useTransactionInfo(txExplorer, addressHash)
  const isGrouplessAddress = isGrouplessAddressWithoutGroupIndex(addressHash)

  const isMoved = infoType === 'move' || (infoType === 'moveGroup' && isGrouplessAddress)

  const isPending = !isConfirmedTx(txExplorer)
  const isFailedScriptExecution = tx.scriptExecutionOk === false

  const hasAlphscanKind = Boolean(tx.alphscan?.category && tx.alphscan?.sub_kind)
  const eventShort = hasAlphscanKind ? resolveEventShortLabel(tx.alphscan!.category, tx.alphscan!.sub_kind) : null
  const contractPageTypeFallback =
    isInContract && !hasAlphscanKind ? resolveEventShortLabel('contract_call', 'call') : null

  const { Icon, badgeColor, label } = getTransactionUI({
    infoType,
    isFailedScriptTx: isFailedScriptExecution,
    isInContract,
    theme,
    direction
  })

  const legacyTypeLabel = tx.alphscan?.type && !hasAlphscanKind ? tx.alphscan.type : label

  const addressLabels = tx.alphscan?.address_labels

  const renderOutputAccounts = () => {
    if (!tx.outputs) return

    // Check if all output addresses are the same for self-transfer, group transfer, or sweep
    const firstAddress = tx.outputs[0]?.address
    if (firstAddress && tx.outputs.every((o) => o.address === firstAddress)) {
      return (
        <AddressLink
          key={firstAddress}
          address={firstAddress}
          maxWidth="250px"
          labelSummary={addressLabels?.[firstAddress]}
        />
      )
    }

    const outputs = _(
      tx.outputs.filter((o) =>
        isGrouplessAddress ? !isSameBaseAddress(addressHash, o.address) : o.address !== addressHash
      )
    )
      .map((v) => v.address)
      .uniq()
      .value()

    const out0 = outputs.at(0) ?? ''
    return (
      <div>
        <AddressLink address={out0} maxWidth="250px" labelSummary={addressLabels?.[out0]} />
        {outputs.length > 1 && ` (+ ${outputs.length - 1})`}
      </div>
    )
  }

  const renderInputAccounts = () => {
    if (!tx.inputs) return
    const inputs = _(tx.inputs.filter((o) => o.address !== addressHash))
      .map((v) => v.address)
      .uniq()
      .value()

    return inputs.length > 0 ? (
      <div>
        {inputs[0] && <AddressLink address={inputs[0]} maxWidth="250px" labelSummary={addressLabels?.[inputs[0]]} />}
        {inputs.length > 1 && ` (+ ${inputs.length - 1})`}
      </div>
    ) : (
      <BlockRewardLabel>{t('Block rewards')}</BlockRewardLabel>
    )
  }

  return (
    <>
      <TableRowStyled key={tx.hash} isActive={detailOpen} onClick={toggleDetail} pending={isPending} disableIntroMotion>
        {/* Hash & Time Column */}
        <HashAndTimestamp>
          <HashLinkWrap>
            <TightLink to={`/transactions/${tx.hash}`} text={tx.hash} maxWidth="120px" />
          </HashLinkWrap>
          {!isPending && tx.timestamp && (
            <Timestamp timeInMs={tx.timestamp} customFormat={TX_LIST_TIMESTAMP_FORMAT} forceFormat="low" />
          )}
        </HashAndTimestamp>

        {/* DApp Column */}
        <DAppCell>
          {tx.alphscan?.main_event_pending === true ? (
            <IndexingDappTile title={t('DApp indexing')}>
              <MdOutlineHourglassFull size={18} aria-hidden />
            </IndexingDappTile>
          ) : tx.alphscan?.dapp_id ? (
            <DAppDisplay dappId={tx.alphscan.dapp_id} />
          ) : (
            <span style={{ color: theme.font.secondary, fontStyle: 'italic' }}>—</span>
          )}
        </DAppCell>

        {/* Type Column */}
        <TypeCell>
          {eventShort ? (
            <EventShortLabelBadge 
              shortLabel={eventShort.shortLabel} 
              variant={eventShort.badgeVariant}
              category={tx.alphscan?.category ?? undefined}
              subKind={tx.alphscan?.sub_kind ?? undefined}
            />
          ) : contractPageTypeFallback ? (
            <EventShortLabelBadge
              shortLabel={contractPageTypeFallback.shortLabel}
              variant={contractPageTypeFallback.badgeVariant}
              category="contract_call"
              subKind="call"
            />
          ) : (
            <LegacyTxTypeBadge
              label={legacyTypeLabel}
              Icon={infoType === 'pending' ? undefined : (Icon as IconType | undefined)}
              leadingSlot={infoType === 'pending' ? <LoadingSpinner size={directionIconSize} /> : undefined}
              accentColor={badgeColor}
              iconSize={directionIconSize}
            />
          )}
          {!isPending && !tx.scriptExecutionOk && (
            <FailedTXBubble tooltipContent={t('Script execution failed')}>!</FailedTXBubble>
          )}
        </TypeCell>

        {/* Assets Column */}
        <Assets>
          {assets.alph.amount !== BigInt(0) && (
            <AssetLogoSlot>
              <AssetLogo key={assets.alph.id} assetId={assets.alph.id} size={21} showTooltip />
            </AssetLogoSlot>
          )}
          {[...assets.fungible, ...assets['non-fungible']].map((a) => (
            <AssetLogoSlot key={a.id}>
              <AssetLogo assetId={a.id} size={21} showTooltip />
            </AssetLogoSlot>
          ))}
        </Assets>

        {/* Addresses Column */}
        <AddressesCell>
          {!isPending &&
            (infoType === 'moveGroup' && direction === 'in' ? (
              renderInputAccounts()
            ) : infoType === 'move' || infoType === 'moveGroup' || infoType === 'out' ? (
              isGrouplessAddress && !direction ? (
                <AddressLink address={addressHash} maxWidth="250px" labelSummary={addressLabels?.[addressHash]} />
              ) : (
                renderOutputAccounts()
              )
            ) : (
              renderInputAccounts()
            ))}
        </AddressesCell>

        {/* Amounts Column */}
        {!isPending && (
          <AmountCell>
            <Amount
              key={assets.alph.id}
              assetId={assets.alph.id}
              value={assets.alph.amount}
              suffix={assets.alph.symbol}
              decimals={assets.alph.decimals}
              highlight
              displaySign
            />
            {assets.fungible.map((asset) => (
              <Amount
                key={asset.id}
                assetId={asset.id}
                value={asset.amount}
                suffix={asset.symbol}
                decimals={asset.decimals}
                highlight
                displaySign
              />
            ))}
            {assets['non-fungible'].map((asset) => (
              <Amount
                key={asset.id}
                assetId={asset.id}
                value={asset.amount}
                color={isMoved ? theme.font.secondary : undefined}
                highlight
                displaySign
              />
            ))}
          </AmountCell>
        )}

        {!isPending && <DetailToggle isOpen={detailOpen} />}
      </TableRowStyled>
      {!isPending && (
        <TableDetailsRow openCondition={detailOpen}>
          <AnimatedCell colSpan={7}>
            <Table transparent noBorder>
              <TableHeader
                headerTitles={[t('Inputs'), '', t('Outputs')]}
                columnWidths={['', '50px', '']}
                compact
                transparent
              />
              <TableBody>
                <TableRow>
                  <IODetailList>
                    {tx.inputs && tx.inputs.length > 0 ? (
                      <TransactionIOList
                        inputs={tx.inputs}
                        IOItemWrapper={IODetailsContainer}
                        addressMaxWidth="180px"
                        flex
                        addressLabelByAddress={addressLabels}
                      />
                    ) : (
                      <BlockRewardInputLabel>{t('Block rewards')}</BlockRewardInputLabel>
                    )}
                  </IODetailList>

                  <ArrowContainer>
                    <RiArrowRightLine size={12} />
                  </ArrowContainer>

                  <IODetailList>
                    {tx.outputs && (
                      <TransactionIOList
                        outputs={tx.outputs}
                        IOItemWrapper={IODetailsContainer}
                        addressMaxWidth="180px"
                        flex
                        addressLabelByAddress={addressLabels}
                      />
                    )}
                  </IODetailList>
                </TableRow>
              </TableBody>
            </Table>
          </AnimatedCell>
        </TableDetailsRow>
      )}
    </>
  )
}

export default AddressAlphscanTransactionRow

const TableRowStyled = styled(TableRow)<{ pending: boolean }>`
  ${({ pending, theme }) =>
    pending &&
    css`
      background-color: ${theme.bg.secondary};
      border-bottom: 1px solid ${theme.border.secondary};
      cursor: initial;

      > * {
        opacity: 0.5;
        animation: opacity-breathing 2s ease infinite;
      }

      @keyframes opacity-breathing {
        0% {
          opacity: 0.4;
        }
        50% {
          opacity: 0.8;
        }
        100% {
          opacity: 0.4;
        }
      }
    `}
`

const BlockRewardLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-style: italic;
`

const BlockRewardInputLabel = styled(BlockRewardLabel)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6px 10px;
`

const DAppCell = styled.div`
  display: flex;
  align-items: center;
  min-width: 100px;
`

const IndexingDappTile = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
  color: ${({ theme }) => theme.font.secondary};
`

const TypeCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  border-radius: 4px;
`

const AddressesCell = styled.div`
  min-width: 150px;
`

const AmountCell = styled.span`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: 600;
  min-height: 28px;
`

const HashLinkWrap = styled.div`
  a {
    color: ${({ theme }) => theme.global.accent};
    font-weight: 600;
  }
`

const HashAndTimestamp = styled.div`
  ${Timestamp} {
    color: ${({ theme }) => theme.font.secondary};
    font-size: 12px;
    margin-top: 2px;
    width: fit-content;
  }
`

const Assets = styled.div`
  display: flex;
  gap: 15px;
  row-gap: 15px;
  flex-wrap: wrap;
  min-height: 28px;
  align-items: center;
`

const AssetLogoSlot = styled.div`
  width: 21px;
  height: 21px;
  flex-shrink: 0;
`

const IODetailList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 6px;
`

const IODetailsContainer = styled.div`
  padding: 6px 10px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const ArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
