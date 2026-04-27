import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import Section from '@/components/Section'
import alephiumLogoRound from '@/images/Alephium-Logo-round.svg'
import NativeTokenDonationPanel from '@/pages/AddressInfoPage/NativeTokenDonationPanel'
import { deviceBreakPoints } from '@/styles/globalStyles'

const ROWS = 28
const COLS = 48
const SEED_DENSITY = 0.2
const TICK_MS = 160

function randomGrid(rows: number, cols: number, density: number): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < density))
}

function countNeighbors(grid: boolean[][], r: number, c: number): number {
  const R = grid.length
  const C = grid[0].length
  let n = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = (r + dr + R) % R
      const nc = (c + dc + C) % C
      if (grid[nr][nc]) n++
    }
  }
  return n
}

function stepGrid(grid: boolean[][]): boolean[][] {
  return grid.map((row, r) =>
    row.map((alive, c) => {
      const neighbors = countNeighbors(grid, r, c)
      if (alive) return neighbors === 2 || neighbors === 3
      return neighbors === 3
    })
  )
}

const NativeTokenEasterEgg = () => {
  const [grid, setGrid] = useState(() => randomGrid(ROWS, COLS, SEED_DENSITY))
  const [paused, setPaused] = useState(false)

  const step = useCallback(() => {
    setGrid((g) => stepGrid(g))
  }, [])

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(step, TICK_MS)
    return () => window.clearInterval(id)
  }, [paused, step])

  const flat = useMemo(() => grid.flat(), [grid])

  return (
    <Section>
      <Wrap>
        <TitleRow>
          <TitleLogo alt="" src={alephiumLogoRound} />
          <Title>Alephium</Title>
        </TitleRow>
        <Subtitle>Hi, I&apos;m alephium the native token. I live everywhere, so I don&apos;t need a contract.</Subtitle>
        <Grid $cols={COLS} role="img" aria-label="Cellular automaton animation">
          {flat.map((alive, i) => (
            <Cell key={i} $alive={alive} />
          ))}
        </Grid>
        <NativeTokenDonationPanel />
      </Wrap>
    </Section>
  )
}

export default NativeTokenEasterEgg

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 0 2rem;
  max-width: 640px;
  margin: 0 auto;
`

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 3vw, 1.25rem);
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`

const TitleLogo = styled.img`
  width: clamp(52px, 14vw, 72px);
  height: clamp(52px, 14vw, 72px);
  flex-shrink: 0;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
`

const Subtitle = styled.p`
  margin: 0 0 1.5rem;
  font-size: clamp(1rem, 2.4vw, 1.15rem);
  line-height: 1.5;
  color: ${({ theme }) => theme.font.secondary};
  max-width: 36rem;
`

const Grid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols}, minmax(0, 1fr));
  width: 100%;
  max-width: 560px;
  gap: 1px;
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.border.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};

  @media ${deviceBreakPoints.mobile} {
    max-width: 100%;
    padding: 8px;
  }
`

const Cell = styled.div<{ $alive: boolean }>`
  aspect-ratio: 1;
  min-width: 0;
  border-radius: 1px;
  background-color: ${({ theme, $alive }) => ($alive ? theme.global.accent : theme.bg.tertiary)};
  opacity: ${({ $alive }) => ($alive ? 1 : 0.55)};
  transition: opacity 0.12s ease-out;
`
