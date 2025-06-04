import { Brandmark } from './Brandmark'
import { Lockup } from './Lockup'
import type { LogoProps } from './types'

const logos = {
  brandmark: Brandmark,
  lockup: Lockup,
}

export const Logo = ({ variant = 'brandmark', color, width, height, ...rest }: LogoProps) => {
  const LogoComponent = logos[variant]
  return <LogoComponent color={color} width={width} height={height} {...rest} />
}
