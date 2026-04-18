import { pickWalletDappIcon, pickWalletDisplayTitle } from '@alphscan/sdk-react'
import { WalletAddressHero } from '@alphscan/sdk-react-ui'
import { useTranslation } from 'react-i18next'

import HighlightedHash from '@/components/HighlightedHash'
import { labelsLookLikeKnowWallet, useExplorerAddressLabels } from '@/hooks/useExplorerAddressLabels'
import AddressKnownContractTitle from '@/pages/AddressPage/AddressKnownContractTitle'
import AddressPageTitle from '@/pages/AddressPage/AddressPageTItle'
import useIsContract from '@/pages/AddressPage/useIsContract'

interface AddressPageHeaderProps {
  addressStr: string
}

/**
 * Address title area: optional wallet hero (AlphScan labels API), else contract-known UI, else generic address title.
 * Lives in this repo under `external/alephium-frontend` — wire `VITE_ALPHSCAN_*` so `getAlphscanRestBaseUrl()` resolves.
 */
const AddressPageHeader = ({ addressStr }: AddressPageHeaderProps) => {
  const { t } = useTranslation()
  const isContract = useIsContract(addressStr)
  const { data: labels = [], isPending } = useExplorerAddressLabels(addressStr, Boolean(addressStr.trim()))

  const walletTitle = pickWalletDisplayTitle(labels)
  const walletIcon = pickWalletDappIcon(labels)
  const knowWallet = labelsLookLikeKnowWallet(labels)
  const hasWalletBranding = Boolean(walletTitle?.trim() || walletIcon)

  const showWalletHero =
    !isPending && hasWalletBranding && (!isContract || knowWallet)

  if (showWalletHero) {
    return (
      <WalletAddressHero title={walletTitle?.trim() || t('Addresses_one')} imageUrl={walletIcon}>
        <HighlightedHash text={addressStr} textToCopy={addressStr} />
      </WalletAddressHero>
    )
  }

  if (isContract) {
    return <AddressKnownContractTitle addressStr={addressStr} />
  }

  return <AddressPageTitle addressStr={addressStr} />
}

export default AddressPageHeader
