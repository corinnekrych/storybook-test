import { GenericBreadCrumb } from './GenericBreadCrumb'
import { IMatch } from './BreadCrumbs';

interface ITeamBreadCrumbProps {
  match: IMatch
}
export const CorrelationIdBreadCrumb = ({ match }: ITeamBreadCrumbProps) => {
  const correlationId = match.params['correlationId'] || ''
  const shortCorrelationId = correlationId?.split('-')[0]

  return <GenericBreadCrumb match={match} name={shortCorrelationId} />
}
