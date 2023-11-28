import { FC, ReactNode } from 'react'
import { ReactComponent as ArrowBackIcon } from 'assets/images/arrow-left.svg'
import { Outlet, useNavigate } from 'react-router-dom'
import styles from './styles.module.scss'
import { Spinner } from 'components/shared'

export interface ContainerLayoutProps {
  title?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  back?: boolean
  loading?: boolean
}

export const ContainerLayout: FC<ContainerLayoutProps> = ({
  title,
  children,
  footer,
  back,
  loading = false
}) => {
  const navigate = useNavigate()

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {title && (
          <div className={styles.header}>
            {back && <ArrowBackIcon className={styles.back} onClick={() => navigate(-1)} />}
            {title}
          </div>
        )}
        <div className={styles.container}>
          {loading ? (
            <div className="flex justify-center items-center">
              <Spinner size={96} />
            </div>
          ) : children ? (
            children
          ) : (
            <Outlet />
          )}
        </div>
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  )
}
