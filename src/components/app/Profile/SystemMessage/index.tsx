import { FC, ReactNode } from 'react'
import classNames from 'classnames'
import styles from './styles.module.scss'

const cx = classNames.bind(styles)

export interface SystemMessageProps {
  children?: ReactNode
  className?: string
  style?: Record<string, string | number>
}

const SystemMessage: FC<SystemMessageProps> = ({ children, className = '', style = {} }) => {
  return (
    <>
      {children && (
        <div className={cx(styles.wrapper, className)} style={{ ...style }}>
          {children}
        </div>
      )}
    </>
  )
}

export default SystemMessage
