import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router-dom'

import { ConfirmationModal } from '../ConfirmationModal'

import type { IConfirmNavigationProps } from './types'

export const ConfirmNavigation = ({
  title,
  content,
  shouldBlock = false,
}: IConfirmNavigationProps) => {
  const { t } = useTranslation('shared-components', {
    keyPrefix: 'navigation-confirmation',
  })

  const blocker = useBlocker(shouldBlock)

  /**
   *  Not to block navigation to the overview page after the new configuration content has been successfully saved.
   */
  useEffect(() => {
    if (blocker.state === 'blocked' && !shouldBlock) {
      blocker.proceed?.()
    }
  }, [blocker, shouldBlock])

  /**
   * {@link React.DependencyList Dependencies} should be {@link blocker} and not {@link blocker.state}.
   * Including only the latter triggers the `react-hooks/exhaustive-deps` rule.
   * Using nested properties as dependencies may lead to stale data.
   * Please see {@link https://github.com/facebook/react/issues/15924#issuecomment-521253636} for more information.
   */
  const proceedNavigation = useCallback(() => blocker.proceed?.(), [blocker])
  const cancelNavigation = useCallback(() => blocker.reset?.(), [blocker])

  /*
   * Autofocus, bydefault, click enter should leave the user on current page
   * disableRestoreFocus is required on Modal as a work around of
   * https://github.com/mui/material-ui/issues/33004#issuecomment-1455260156
   * */
  return blocker.state ? (
    <ConfirmationModal.Modal
      disableRestoreFocus
      data-testid="edit-navigate-away"
      open={blocker.state === 'blocked'}
      onClose={cancelNavigation}
    >
      <ConfirmationModal.Title>{title}</ConfirmationModal.Title>
      <ConfirmationModal.Content>
        <ConfirmationModal.ContentText>{content}</ConfirmationModal.ContentText>
      </ConfirmationModal.Content>
      <ConfirmationModal.Actions>
        <ConfirmationModal.ActionItem onClick={proceedNavigation} data-testid="navigate-confirm">
          {t('go')}
        </ConfirmationModal.ActionItem>
        <ConfirmationModal.ActionItem
          autoFocus
          variant="contained"
          onClick={cancelNavigation}
          data-testid="navigate-cancel"
        >
          {t('cancel')}
        </ConfirmationModal.ActionItem>
      </ConfirmationModal.Actions>
    </ConfirmationModal.Modal>
  ) : null
}
