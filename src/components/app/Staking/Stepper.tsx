import { FC } from 'react'

import Step1 from 'assets/images/step-1.svg'
import Step2 from 'assets/images/step-2.svg'
import Step3 from 'assets/images/step-3.svg'
import Step4 from 'assets/images/step-4.svg'
import Step5 from 'assets/images/step-5.svg'
import styles from './styles.module.scss'

interface IProps {
  step: number
}

const STEPS = [Step1, Step2, Step3, Step4, Step5]

const Stepper: FC<IProps> = ({ step }) => {
  return (
    <div className={styles.stepper}>
      <img src={STEPS[step - 1]} className="absolute w-11 h-11" />
      <span className={styles.stepperLabel}>{step} of 3</span>
    </div>
  )
}

export default Stepper
