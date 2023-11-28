import { FC, ReactNode } from 'react'
import classNames from 'classnames'
import styles from './styles.module.scss'
import { Tooltip } from 'components/shared'

const cx = classNames.bind(styles)

export interface StatCardProps {
  label: ReactNode
  children?: ReactNode
  empty?: boolean
  tooltip?: ReactNode
  className?: string
  style?: Record<string, string | number>
}

export const StatCard: FC<StatCardProps> = ({
  label,
  children,
  empty = false,
  tooltip,
  className = '',
  style = {}
}) => {
  const isValueEmpty = !children || empty

  return (
    <div className={cx(styles.card, className)} style={{ ...style }}>
      <div className={styles.label}>
        {label}
        <Tooltip message={tooltip} />
      </div>
      <div className={cx(styles.value, isValueEmpty ? styles.empty : '')}>
        {isValueEmpty ? '--' : children}
      </div>
    </div>
  )
}
