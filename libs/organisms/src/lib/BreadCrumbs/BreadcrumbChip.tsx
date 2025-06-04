import { createElement } from 'react'
import { useMatches } from 'react-router-dom'

import type { IMatch } from '@cloudbees/shared-types/types/match'

export const BreadcrumbChip = () => {
  const matches = useMatches() as IMatch[]
  const lastMatch = matches[matches.length - 1]
  const chip = lastMatch.handle?.breadcrumbChip

  if (typeof chip === 'function') {
    return createElement(chip)
  }

  return null
}
