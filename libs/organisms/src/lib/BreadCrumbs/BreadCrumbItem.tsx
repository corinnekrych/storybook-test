import { useTranslation } from 'react-i18next'
import MUILink from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/system'
import DOMPurify from 'dompurify'
import { Link } from 'react-router-dom';

export interface IBreadcrumb {
  href?: string
  name?: string
  capitalize?: boolean
}


export interface IBreadCrumbItemProps {
  crumb: IBreadcrumb
  active?: boolean
  sx?: SxProps
}
const T_KEY_PREFIX = 'breadcrumbs'

export const BreadCrumbItem = ({ crumb, active, sx }: IBreadCrumbItemProps) => {
  const { t, i18n } = useTranslation('global', { keyPrefix: T_KEY_PREFIX })

  const isInternalLink = crumb.href?.startsWith('/') || false

  if (!crumb.name || crumb.name.trim() === '')
    return <Skeleton sx={{ fontSize: '1rem', bgcolor: 'grey.800' }} width={80} />

  const displayName = i18n.exists(`global:${T_KEY_PREFIX}.${crumb.name}`)
    ? t(crumb.name)
    : crumb.name

  if (!crumb.href)
    return (
      <Typography
        sx={theme => ({
          color: active ? theme.palette.text.primary : theme.palette.grey['600'],
          textTransform: crumb.capitalize ? 'capitalize' : 'none',
        })}
        data-testid="crumb-current"
        // To support HTML tag (eg.superscript) in display name
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayName) }}
      />
    )

  return isInternalLink ? (
    <MUILink
      sx={{
        color: theme => theme.palette.grey['600'],
        textTransform: crumb.capitalize ? 'capitalize' : 'none',
        ...sx,
      }}
      data-testid="crumb-internal"
      underline="hover"
      component={Link}
      to={crumb.href}
    >
      {displayName}
    </MUILink>
  ) : (
    <MUILink data-testid="crumb-external" underline="hover" href={crumb.href}>
      {displayName}
    </MUILink>
  )
}
