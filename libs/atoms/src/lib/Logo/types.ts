export interface SharedLogoProps {
  color?: string
  height?: number
  width?: number
}

export interface LogoProps extends SharedLogoProps {
  // 'logotype' will be added later, if you need it, please let me know @jackoliver
  variant?: 'brandmark' | 'lockup'
}
