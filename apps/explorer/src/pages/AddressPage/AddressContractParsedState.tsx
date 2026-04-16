import { addressFromContractId } from '@alephium/web3'
import { useContractRecord, type AlphscanContractRecordField } from '@alphscan/sdk-react'
import {
  ContractHierarchyNav,
  ContractParsedStateView,
  type ContractFieldForState,
} from '@alphscan/sdk-react-ui'
import '@alphscan/sdk-react-ui/styles.css'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LoadingSpinner from '@/components/LoadingSpinner'
import useIsContract from '@/pages/AddressPage/useIsContract'
import { contractRecordToSummary, getAlphscanContractApiSettings } from '@/pages/AddressPage/alphscanContractUtils'

function explorerHrefForTokenIdHex(hexLower: string): string {
  const h = hexLower.replace(/^0x/i, '').toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(h)) return `/addresses/${hexLower}`
  try {
    return `/addresses/${addressFromContractId(h)}`
  } catch {
    return `/addresses/0x${h}`
  }
}

function toViewFields(rows: AlphscanContractRecordField[]): ContractFieldForState[] {
  return rows.map((f) => ({
    field_index: f.field_index,
    field_name: f.field_name,
    artifact_field_type: f.artifact_field_type,
    is_mutable: f.is_mutable,
    state_type: f.state_type,
    value_text: f.value_text,
    parsed_value_text: f.parsed_value_text ?? null,
    resolved_token_id: f.resolved_token_id ?? null,
    resolved_link_address: f.resolved_link_address ?? null,
    resolved_token_logo_uri: f.resolved_token_logo_uri ?? null,
    resolved_http_url: f.resolved_http_url ?? null,
    resolved_media_cdn_url: f.resolved_media_cdn_url ?? null,
    resolved_media_cdn_preview_url: f.resolved_media_cdn_preview_url ?? null,
    resolved_media_cached_at: f.resolved_media_cached_at ?? null,
    resolved_media_last_verified_at: f.resolved_media_last_verified_at ?? null,
    resolved_media_source_origin: f.resolved_media_source_origin ?? null,
    resolved_media_hoster_logo_uri: f.resolved_media_hoster_logo_uri ?? null,
  }))
}

interface AddressContractParsedStateProps {
  addressStr: string
}

const AddressContractParsedState = ({ addressStr }: AddressContractParsedStateProps) => {
  const { t } = useTranslation()
  const isContract = useIsContract(addressStr)

  const { apiUrl: alphscanApiUrl, apiKey: alphscanApiKey, version: alphscanApiStage, dappLogosBase } =
    getAlphscanContractApiSettings()

  const { data, loading, error } = useContractRecord(addressStr, {
    settings: {
      apiUrl: alphscanApiUrl,
      apiKey: alphscanApiKey,
      version: alphscanApiStage,
    },
    enabled: isContract,
  })

  const parentAddr = data?.contract.parent_address?.trim() ?? ''
  const { data: parentData } = useContractRecord(parentAddr || undefined, {
    settings: {
      apiUrl: alphscanApiUrl,
      apiKey: alphscanApiKey,
      version: alphscanApiStage,
    },
    enabled: isContract && Boolean(parentAddr),
  })

  const getDappIconUrl = (dappId: string): string | undefined => {
    const id = dappId.replace(/[^a-zA-Z0-9_-]/g, '')
    if (!id || !dappLogosBase) return undefined
    return `${dappLogosBase}/data/dapps/${id}.svg`
  }

  if (!isContract) return null

  if (loading) {
    return (
      <Block>
        <SectionHeader>
          <h2>{t('Contract state')}</h2>
        </SectionHeader>
        <SpinnerRow>
          <LoadingSpinner />
        </SpinnerRow>
      </Block>
    )
  }

  if (error) {
    return (
      <Block>
        <SectionHeader>
          <h2>{t('Contract state')}</h2>
        </SectionHeader>
        <Muted role="status">{error.message}</Muted>
      </Block>
    )
  }

  if (!data) {
    return null
  }

  const viewFields = toViewFields(data.fields ?? [])
  const contract = data.contract
  const parentContract = parentAddr && parentData?.contract ? contractRecordToSummary(parentData.contract) : undefined

  return (
    <Block>
      <SectionHeader>
        <h2>{t('Contract state')}</h2>
      </SectionHeader>
      {viewFields.length === 0 ? (
        <Muted>{t('No indexed contract state is available for this address yet.')}</Muted>
      ) : (
        <ContractParsedStateView
          fields={viewFields}
          contractName={contract.contract_name}
          resolvedInterface={contract.contract_interface ?? contract.interface_id}
          getAddressHref={(address) => `/addresses/${address}`}
          getTokenHref={(tokenIdHexLower) => explorerHrefForTokenIdHex(tokenIdHexLower)}
        />
      )}
      <HierarchyWrap>
        <ContractHierarchyNav
          contractAddress={contract.address}
          parentAddress={contract.parent_address}
          parentContract={parentContract}
          expectedChildCount={contract.n_childs}
          getContractHref={(a) => `/addresses/${a}`}
          alphscanApiUrl={alphscanApiUrl}
          alphscanApiKey={alphscanApiKey}
          alphscanApiVersion={alphscanApiStage}
          getDappIconUrl={dappLogosBase ? getDappIconUrl : undefined}
          dappLocalLogoBaseUrl={dappLogosBase}
        />
      </HierarchyWrap>
    </Block>
  )
}

export default AddressContractParsedState

const Block = styled.div`
  margin-top: 35px;
`

const HierarchyWrap = styled.div`
  margin-top: 12px;
`

const SectionHeader = styled.div`
  margin-bottom: 10px;

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
`

const SpinnerRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
`

const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.font.secondary};
  font-size: 0.875rem;
`
