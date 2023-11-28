import { FC, PropsWithChildren } from 'react'

import styles from './styles.module.scss'

const StakingBody: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.stakingBody}>{children}</div>
}

export default StakingBody
