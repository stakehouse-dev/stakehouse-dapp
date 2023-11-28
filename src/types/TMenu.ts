import { ReactNode } from 'react'

export type TMenu = {
  id: number
  icon?: ReactNode
  label: ReactNode
  disabled?: boolean
  helper?: string
  onClick?: () => void
}
