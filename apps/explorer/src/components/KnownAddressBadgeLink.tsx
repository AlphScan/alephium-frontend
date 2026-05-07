import { getAddressExplorerPagePath } from '@alephium/shared-react'
import type { AddressLabelMainSummary } from '@alphscan/sdk'
import { displayTitleFromAddressLabelMain } from '@alphscan/sdk-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Ellipsed from '@/components/Ellipsed'

export interface KnownAddressBadgeLinkProps {
  address: string
  summary: AddressLabelMainSummary
  maxWidth?: string
  className?: string
}

const KnownAddressBadgeLink = ({ address, summary, maxWidth = '250px', className }: KnownAddressBadgeLinkProps) => {
  const title = displayTitleFromAddressLabelMain(summary)
  const icon = summary.icon?.trim()

  return (
    <Outer className={className} style={{ maxWidth }} data-tooltip-id="default" data-tooltip-content={address}>
      <BadgeLink to={getAddressExplorerPagePath(address)} onClick={(e) => e.stopPropagation()}>
        {icon ? (
          <ThumbWrap>
            <Thumb src={icon} alt="" />
          </ThumbWrap>
        ) : null}
        <LabelText>
          <Ellipsed text={title} />
        </LabelText>
      </BadgeLink>
    </Outer>
  )
}

export default KnownAddressBadgeLink

const Outer = styled.div`
  display: flex;
  overflow: hidden;
`

const BadgeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 2px 10px 2px 4px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  color: ${({ theme }) => theme.global.accent};
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.global.accent};
  }
`

const ThumbWrap = styled.span`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background: ${({ theme }) => theme.bg.primary};
`

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const LabelText = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
`
