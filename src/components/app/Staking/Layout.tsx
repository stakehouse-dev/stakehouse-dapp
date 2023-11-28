import { FC, PropsWithChildren } from 'react'

import StakingBody from './Body'
import StakingHeader from './Header'

import styles from './styles.module.scss'

interface IProps {
  currentStep: number
  title: string
  showSelectMode?: boolean
  onChangeMode?: () => void
}

const StakingLayout: FC<PropsWithChildren<IProps>> = ({
  currentStep,
  title,
  showSelectMode,
  onChangeMode,
  children
}) => {
  return (
    <div className={styles.staking}>
      <div className={styles.stakingContainer}>
        <StakingHeader
          currentStep={currentStep}
          title={title}
          showSelectMode={showSelectMode}
          onChangeMode={onChangeMode}
        />
        <StakingBody>{children}</StakingBody>
      </div>
    </div>
  )
}

export default StakingLayout
