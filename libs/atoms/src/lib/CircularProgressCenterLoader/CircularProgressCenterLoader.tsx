import Box from '@mui/material/Box'
import CircularProgress, { type CircularProgressProps } from '@mui/material/CircularProgress'

export const CircularProgressCenterLoader = (props: CircularProgressProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme => theme.palette.background.default,
      }}
    >
      <CircularProgress
        color="primary"
        {...props}
        data-testid={'data-testid' in props ? `${props['data-testid']}-loader` : 'loader'}
      />
    </Box>
  )
}
