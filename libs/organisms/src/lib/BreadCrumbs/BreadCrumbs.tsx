import { cloneElement, createElement } from 'react'
import { useMatches } from 'react-router-dom'
import Box from '@mui/material/Box'
import MUIBreadcrumbs from '@mui/material/Breadcrumbs'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Params } from 'react-router-dom'


import { BreadcrumbChip } from './BreadcrumbChip'
import { GenericBreadCrumb } from './GenericBreadCrumb'

export interface IMatch {
  id: string
  pathname: string
  params: Params<string>
  data: unknown
  handle?: any
}

export const BreadCrumbs = () => {


  const matches = useMatches() as IMatch[]

  const crumbMatches = matches.filter(match => match.handle?.crumb)
  const breadcrumbMatches = matches.filter(match => match.handle?.breadcrumb)

  const { breakpoints } = useTheme()
  const maxMatch = useMediaQuery(breakpoints.up('md'))

  if (matches.length === 0) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        mb: 0,
        ml:  1.75,
        alignItems: 'center',
      }}
    >
      <MUIBreadcrumbs maxItems={maxMatch ? 5 : 2} aria-label="breadcrumb">
        {crumbMatches.map((match, index) => {
          const oldActive = match.handle?.crumb?.(match, index === crumbMatches.length - 1)

          if (!oldActive) return null

          return cloneElement(oldActive, {
            key: match.id || index,
          })
        })}
        {breadcrumbMatches.map((match: IMatch) => {
          const breadcrumb = match.handle?.breadcrumb

          if (!breadcrumb) return null

          const key = match.pathname

          if (typeof breadcrumb === 'string') {
            return <GenericBreadCrumb name={breadcrumb} match={match} key={key} />
          }

          return createElement<{ match?: IMatch }>(breadcrumb, { match, key })
        })}
      </MUIBreadcrumbs>
      <BreadcrumbChip />
    </Box>
  )
}
