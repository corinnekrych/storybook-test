import { useMemo } from 'react'
import CopyAllIcon from '@mui/icons-material/CopyAll'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { debounce } from '@mui/material';


export const CopyButton = ({ onClick, ...props }: IconButtonProps) => {



  const debouncedNotify = useMemo(
    () =>
      debounce(() => {
        console.log('copied-successfully') // TODO: Replace with actual notification logic
      }, 300),
    [],
  )

  const onCopyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    debouncedNotify()
  }

  return (
    <Tooltip title={"Copy"} placement="top" arrow enterDelay={400}>
      <IconButton {...props} data-testid="copy-button" onClick={e => onCopyClick(e)}>
        <CopyAllIcon />
      </IconButton>
    </Tooltip>
  )
}
