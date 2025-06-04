import { useMatch } from 'react-router-dom'

import { BreadCrumbItem } from './BreadCrumbItem'
import { IMatch } from './BreadCrumbs';

interface IGenericBreadCrumbProps {
  match: IMatch
  name: string
}

export const GenericBreadCrumb = ({ match, name }: IGenericBreadCrumbProps) => {
  const active = useMatch(match.pathname)

  return (
    <BreadCrumbItem
      crumb={{
        name,
        href: !active ? match.pathname : undefined,
      }}
      active={!!active}
    />
  )
}
