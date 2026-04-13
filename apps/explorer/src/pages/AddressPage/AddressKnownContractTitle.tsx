import { useContractRecord } from '@alphscan/sdk-react'
import { knownContractHeading } from '@alphscan/sdk-react-ui'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import HighlightedHash from '@/components/HighlightedHash'
import SectionTitle from '@/components/SectionTitle'
import { deviceBreakPoints } from '@/styles/globalStyles'

import ExplorerContractAvatar from '@/pages/AddressPage/ExplorerContractAvatar'
import {
  contractRecordToSummary,
  tokenWebsiteFromRecord,
  getAlphscanContractApiSettings,
  type AlphscanContractRecordWithMeta,
} from '@/pages/AddressPage/alphscanContractUtils'

interface AddressKnownContractTitleProps {
  addressStr: string
}

const AddressKnownContractTitle = ({ addressStr }: AddressKnownContractTitleProps) => {
  const { t } = useTranslation()
  const { apiUrl, apiKey, version, dappLogosBase } = getAlphscanContractApiSettings()

  const { data, loading, error } = useContractRecord(addressStr, {
    settings: {
      apiUrl,
      apiKey,
      version,
    },
    enabled: true,
  })

  const record = data?.contract as AlphscanContractRecordWithMeta | undefined
  const website = record ? tokenWebsiteFromRecord(record) : ''

  if (loading) {
    return (
      <SectionTitle
        title={t('Contract')}
        subtitle={<HighlightedHash text={addressStr} textToCopy={addressStr} />}
        isLoading
      />
    )
  }

  if (error || !record) {
    return (
      <SectionTitle
        title={t('Contract')}
        subtitle={<HighlightedHash text={addressStr} textToCopy={addressStr} />}
      />
    )
  }

  const summary = contractRecordToSummary(record)
  const { primary, qualifier } = knownContractHeading(summary)

  return (
    <TitleBlock>
      <TopRow>
        <LeftBlock>
          <ExplorerContractAvatar row={summary} size="lg" dappLocalLogoBaseUrl={dappLogosBase} />
          <HeadingText>
            <MainHeading>
              {primary}{' '}
              <Qualifier>({qualifier})</Qualifier>
            </MainHeading>
          </HeadingText>
        </LeftBlock>
        <LinksBlock>
          {website ? (
            <ExternalHeaderLink href={website} target="_blank" rel="noopener noreferrer">
              {t('Contract website')}
            </ExternalHeaderLink>
          ) : null}
        </LinksBlock>
      </TopRow>
      <HashSubtitle>
        <HighlightedHash text={addressStr} textToCopy={addressStr} />
        {record.mint_tx ? (
          <MintTxAfterHash>
            <MintLink to={`/transactions/${record.mint_tx}`}>({t('mint transaction')})</MintLink>
          </MintTxAfterHash>
        ) : null}
      </HashSubtitle>
    </TitleBlock>
  )
}

export default AddressKnownContractTitle

const TitleBlock = styled.div`
  margin-bottom: 10px;
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const LeftBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1 1 240px;
`

const HeadingText = styled.div`
  min-width: 0;
`

const MainHeading = styled.h1`
  margin: 0;
  font-weight: 600;
  font-size: 2.1rem;
  line-height: 1.25;
  color: ${({ theme }) => theme.font.primary};
  word-break: break-word;

  @media ${deviceBreakPoints.mobile} {
    font-size: 1.75rem;
  }
`

const Qualifier = styled.span`
  font-weight: 500;
  font-size: 0.88em;
  color: ${({ theme }) => theme.font.secondary};
`

const LinksBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
`

const headerLinkCss = `
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

const MintLink = styled(Link)`
  ${headerLinkCss}
  color: ${({ theme }) => theme.global.accent};
`

const ExternalHeaderLink = styled.a`
  ${headerLinkCss}
  color: ${({ theme }) => theme.global.accent};
`

const HashSubtitle = styled.div`
  margin-top: 12px;
  margin-bottom: 20px;
  font-size: 1.6rem;
  font-weight: 500;
  color: ${({ theme }) => theme.font.secondary};
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 0.75rem;
`

const MintTxAfterHash = styled.span`
  font-size: 1rem;
  font-weight: 500;
`
