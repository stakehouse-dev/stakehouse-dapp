import { FC, useContext, useEffect, useState } from 'react'
import { Switch } from '@headlessui/react'
import { useLocation } from 'react-router-dom'

import Stepper from './Stepper'
import { ModalToggleMode } from '../Modals'
import { Dropdown, Tooltip } from 'components/shared'

import { StakingStoreContext } from 'context/StakingStoreContext'
import { EASY_ROUTES, EXPERT_ROUTES } from 'constants/routes'
import { STAKING_MODE, TMenu } from 'types'

import { ReactComponent as ThreeDotIcon } from 'assets/images/icon-dot-three.svg'
import { ReactComponent as SpinnetIcon } from 'assets/images/icon-snippet.svg'
import styles from './styles.module.scss'

interface IProps {
  currentStep: number
  title: string
  showSelectMode?: boolean
  onChangeMode?: () => void
}

const StakingHeader: FC<IProps> = ({
  currentStep,
  title,
  showSelectMode = false,
  onChangeMode
}) => {
  const { pathname } = useLocation()
  const { mode, setMode } = useContext(StakingStoreContext)

  const [openToggleModeDlg, setOpenToggleModeDlg] = useState(false)

  useEffect(() => {
    if (pathname) {
      const stakingRoute = pathname.split('/').pop()
      if (EASY_ROUTES.includes(stakingRoute!)) {
        setMode(STAKING_MODE.EASY)
      } else if (EXPERT_ROUTES.includes(stakingRoute!)) {
        setMode(STAKING_MODE.EXPOERT)
      }
    }
  }, [pathname])

  const handleOpenToggleModeDlg = () => setOpenToggleModeDlg(true)
  const handleCloseToggleModeDlg = () => setOpenToggleModeDlg(false)

  const handleChangeMode = () => {
    if (mode === STAKING_MODE.EASY) {
      return handleOpenToggleModeDlg()
    }

    if (onChangeMode) {
      onChangeMode()
    }
  }

  const menuOptions: TMenu[] = [
    {
      id: 0,
      label: (
        <div className="flex items-center gap-1">
          Expert Mode
          <Tooltip
            message={
              <>
                <p>
                  Please follow the Expert Mode{' '}
                  <a
                    className="underline text-primary300"
                    target="_blank"
                    rel="noreferrer"
                    href="https://help.joinstakehouse.com/en/articles/6206942-how-do-i-stake-a-validator-using-the-ethereum-cli">
                    guide
                  </a>{' '}
                  or your deposits may fail.
                </p>
              </>
            }
          />
          <Switch
            checked={!pathname.includes('validator-password')}
            onChange={handleChangeMode}
            className={`${
              !pathname.includes('validator-password') ? 'bg-primary500' : 'bg-grey700'
            } relative inline-flex h-5 w-9 shrink-0 ml-2.5 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}>
            <span className="sr-only">Use setting</span>
            <div
              aria-hidden="true"
              className={`${
                !pathname.includes('validator-password') ? 'translate-x-3.5' : 'translate-x-0'
              } pointer-events-none inline-block h-4 w-4 transform rounded-full m-0.5 bg-black shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
      ),
      icon: <SpinnetIcon />
    }
  ]

  return (
    <div className={styles.stakingHeader}>
      <div className="flex items-center gap-6">
        <Stepper step={currentStep} />
        <p className={styles.stakingHeaderTitle}>{title}</p>
      </div>
      {showSelectMode && (
        <Dropdown options={menuOptions}>
          <div className={styles.stakingHeaderSetting}>
            <ThreeDotIcon />
          </div>
        </Dropdown>
      )}
      <ModalToggleMode
        open={openToggleModeDlg}
        onClose={handleCloseToggleModeDlg}
        onConfirm={onChangeMode!}
      />
    </div>
  )
}

export default StakingHeader
