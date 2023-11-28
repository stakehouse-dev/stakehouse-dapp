import { FC, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Switch } from '@headlessui/react'

import { Dropdown } from 'components/shared'
import { ModalToggleMode } from '../Modals'

import { MintStoreContext } from 'context/MintStoreContext'
import { MINT_MODE, TMenu } from 'types'

import { ReactComponent as ThreeDotIcon } from 'assets/images/icon-dot-three.svg'
import { ReactComponent as ArrowLeftIcon } from 'assets/images/icon-arrow-left.svg'
import { ReactComponent as GroupIcon } from 'assets/images/icon-people-group.svg'
import styles from './styles.module.scss'

interface IProps {
  minted: boolean
}

const MintingHeader: FC<IProps> = ({ minted }) => {
  const navigate = useNavigate()
  const { mode, setMode } = useContext(MintStoreContext)
  const { pathname } = useLocation()
  const { id } = useParams()
  const isCreate = pathname.includes('/create')

  const [openToggleModeDlg, setOpenToggleModeDlg] = useState(false)

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleOpenToggleModeDlg = () => setOpenToggleModeDlg(true)
  const handleCloseToggleModeDlg = () => setOpenToggleModeDlg(false)

  const handleChangeMode = () => {
    if (mode === MINT_MODE.JOIN) {
      return handleOpenToggleModeDlg()
    }

    handleToggleMode()
  }

  useEffect(() => {
    if (isCreate) {
      setMode(MINT_MODE.CREATE)
    } else {
      setMode(MINT_MODE.JOIN)
    }
  }, [isCreate])

  const handleToggleMode = () => {
    if (mode === MINT_MODE.JOIN) {
      navigate('create')
    } else {
      navigate(`/mint/${id}`)
    }
  }

  const menuOptions: TMenu[] = [
    {
      id: 0,
      label: (
        <div className="flex items-center gap-1">
          Create a Stakehouse
          <Switch
            checked={mode === MINT_MODE.CREATE}
            onChange={handleChangeMode}
            className={`${
              mode === MINT_MODE.CREATE ? 'bg-primary500' : 'bg-grey700'
            } relative inline-flex h-5 w-9 shrink-0 ml-2.5 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}>
            <span className="sr-only">Use setting</span>
            <div
              aria-hidden="true"
              className={`${
                mode === MINT_MODE.CREATE ? 'translate-x-3.5' : 'translate-x-0'
              } pointer-events-none inline-block h-4 w-4 transform rounded-full m-0.5 bg-black shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
      ),
      icon: <GroupIcon />
    }
  ]

  return (
    <div className={styles.header}>
      <div className={styles.headerMain}>
        <button onClick={handleGoBack}>
          <ArrowLeftIcon />
        </button>
        <p className={styles.headerName}>
          {mode === MINT_MODE.CREATE ? 'Create a Stakehouse' : 'Join a Stakehouse'}
        </p>
      </div>
      {!minted && (
        <Dropdown options={menuOptions}>
          <div className={styles.stakingHeaderSetting}>
            <ThreeDotIcon />
          </div>
        </Dropdown>
      )}
      <ModalToggleMode
        open={openToggleModeDlg}
        onClose={handleCloseToggleModeDlg}
        onConfirm={handleToggleMode}
        description="There are many advantages to larger Stakehouses. Are you going to going to bring a community of validators?"
        okBtnTxt={`I'm the first of many`}
        cancelBtnTxt={`Back to Join a Stakehouse`}
      />
    </div>
  )
}

export default MintingHeader
