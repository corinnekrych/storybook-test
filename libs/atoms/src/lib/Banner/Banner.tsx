import Alert, { type AlertProps } from '@mui/material/Alert'
import Typography from '@mui/material/Typography'

export const Banner = ({ children, ...props }: AlertProps) => {
  return (
    <Alert
      sx={theme => ({
        'alignItems': 'center',
        'borderBottom': `1px solid ${theme.palette.divider}`,
        'borderRadius': 0,
        '& .MuiAlert-action': { p: 0, mr: 0, alignItems: 'center' },
      })}
      {...props}
    >
      <Typography>{children}</Typography>
    </Alert>
  )
}
