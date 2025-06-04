import type { FC } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import type {
  IConfirmationActionsProps,
  IConfirmationContentProps,
  IConfirmationContentTextProps,
  IConfirmationModalProps,
  IConfirmationTitleProps,
} from './types'

const Modal: FC<IConfirmationModalProps> = ({ children, onClose, open, ...props }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" sx={{ p: 2 }} {...props}>
      {children}
    </Dialog>
  )
}

const Title: FC<IConfirmationTitleProps> = ({ children }) => {
  return <DialogTitle>{children}</DialogTitle>
}

const Content: FC<IConfirmationContentProps> = ({ children }) => {
  return <DialogContent sx={{ py: 1, px: 3 }}>{children}</DialogContent>
}

const ContentText: FC<IConfirmationContentTextProps> = ({ children, ...restOfProps }) => {
  return <DialogContentText {...restOfProps}>{children}</DialogContentText>
}

const Actions: FC<IConfirmationActionsProps> = ({ children, sx }) => {
  return <DialogActions sx={{ p: 1, ...sx }}>{children}</DialogActions>
}

Modal.displayName = 'ConfirmationModalModal'
Title.displayName = 'ConfirmationModalTitle'
Content.displayName = 'ConfirmationModalContent'
ContentText.displayName = 'ConfirmationModalContentText'
Actions.displayName = 'ConfirmationModalActions'

const ConfirmationModal = {
  Modal,
  Title,
  Content,
  ContentText,
  Actions,
  ActionItem: LoadingButton,
}

export { ConfirmationModal }
