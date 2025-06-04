import type { ReactNode } from 'react'
import type { DialogProps } from '@mui/material/Dialog'
import type { DialogActionsProps } from '@mui/material/DialogActions'
import type { DialogContentProps } from '@mui/material/DialogContent'
import type { DialogContentTextProps } from '@mui/material/DialogContentText'
import type { DialogTitleProps } from '@mui/material/DialogTitle'
import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/system/styleFunctionSx'

export interface IConfirmationModalProps extends DialogProps {
  children: ReactNode | ReactNode[]
}

export interface IConfirmationTitleProps extends DialogTitleProps {
  children: string | ReactNode
}

export interface IConfirmationContentProps extends DialogContentProps {
  children: ReactNode
}

export interface IConfirmationContentTextProps extends DialogContentTextProps {
  children?: ReactNode
}

export interface IConfirmationActionsProps extends DialogActionsProps {
  children: ReactNode
  sx?: SxProps<Theme>
}
