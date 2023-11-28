import { FC, ReactNode } from 'react'

import './styles.scss'

export interface BSCheckboxProps {
  value: boolean
  children?: ReactNode
  color?: string
  tickColor?: string
  disabled?: boolean
  style?: Record<string, number | string>
  onChange?: (isEnabled: boolean) => void
}

export interface StylingVariablesMap {
  [stylingRule: string]: string
}

export const BSCheckbox: FC<BSCheckboxProps> = ({
  value,
  disabled = false,
  children,
  color = '#00ED7B',
  tickColor = '#1C1C1E',
  style = {},
  onChange = () => {}
}) => {
  const styleVariables: StylingVariablesMap = {
    '--bs-checkbox-color': color,
    '--bg-checkbox-tick-color': tickColor
  }

  return (
    <label
      className={`
        ${disabled ? 'bscheckbox--disabled' : 'bscheckbox'}
      `}
      style={{ ...styleVariables, ...style }}>
      {children && <div className="checkbox-label">{children}</div>}
      <input
        type="checkbox"
        disabled={disabled}
        className="checkbox-input"
        checked={value}
        onChange={() => onChange(!value)}
      />
      <span className="checkbox-checkmark" />
    </label>
  )
}
