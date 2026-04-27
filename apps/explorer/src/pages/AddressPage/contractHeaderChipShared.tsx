import styled, { css } from 'styled-components'

/** Shared shell for native token id row and bridged mapping row (full width, same chrome). */
export const fungibleHeaderChipShellCss = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: 8px 12px 8px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background: ${({ theme }) => theme.bg.secondary};
  min-width: 0;
`

export const NativeTokenChipShell = styled.div`
  ${fungibleHeaderChipShellCss}
`

export const BridgedTokenChipLink = styled.a`
  ${fungibleHeaderChipShellCss}
  text-decoration: none;
  color: inherit;
  &:hover {
    border-color: ${({ theme }) => theme.global.accent};
  }
`

export const ChipSymbol = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
  flex-shrink: 0;
`

/** Same gradient “hash” treatment as {@link HighlightedHash} main segment. */
export const ChipIdGradient = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
  background: ${({ theme }) => theme.global.highlight};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`

export const ChipTrailingActions = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  color: ${({ theme }) => theme.font.secondary};
`

export const ChipChainLogo = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
`

export const ChipLogoPlaceholder = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  background: ${({ theme }) => theme.bg.primary};
`
