import { Button } from 'components/shared'
import { Link, useNavigate } from 'react-router-dom'

import { ReactComponent as NotFoundImage } from 'assets/images/404.svg'
import { ReactComponent as ArrowLeftIcon } from 'assets/images/arrow-left.svg'
import styles from './styles.module.scss'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <p className="text-primary700 text-base font-semibold mb-3">404 error</p>
          <h1 className="text-grey25 text-6xl font-semibold mb-6">Page not found</h1>
          <p className="text-grey300 text-xl mb-12">The page you are looking for does not exist.</p>
          <div className="flex gap-3">
            <Link to="/staking/validator-password">
              <Button variant="secondary">
                <span className="text-base font-medium text-grey100">Stake ETH</span>
              </Button>
            </Link>
            <Link to="/">
              <Button>
                <span className="text-base">My Profile</span>
              </Button>
            </Link>
          </div>
        </div>
        <NotFoundImage />
      </div>
    </div>
  )
}

export default NotFoundPage
