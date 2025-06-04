

import { GenericBreadCrumb } from './GenericBreadCrumb'
import { IMatch } from './BreadCrumbs';

interface ITeamBreadCrumbProps {
  match: IMatch
}
export const OrgDomainBreadCrumb = ({ match }: ITeamBreadCrumbProps) => {
  const name = match.params['orgDomain'] || 'organization'

  return <GenericBreadCrumb match={match} name={name} />
}
