import { FC, useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAccount, useBalance } from 'wagmi'

import NavItem from './NavItem'
import { ButtonWalletConnect, ModalInsufficientBalance } from 'components/app'

import { StakingStoreContext } from 'context/StakingStoreContext'
import { config } from 'constants/environment'

import { ReactComponent as ArrowTopRightIcon } from 'assets/images/icon-arrow-up-right.svg'
import Logo from 'assets/images/logo.svg'
import '../styles.scss'
import ModalLegalPrivacy from 'components/app/Modals/ModalLegalPrivacy'

const Topbar: FC = () => {
  const navigate = useNavigate()
  const { isConnected, address } = useAccount()
  const { pathname } = useLocation()
  const { clearAllData } = useContext(StakingStoreContext)

  const { data: { formatted: ethBalance } = {} } = useBalance({
    address: address,
    formatUnits: 'ether',
    chainId: config.networkId
  })

  const [openInsufficientModal, setOpenInsufficientModal] = useState(false)

  const handleCreateValidator = () => {
    if (Number(ethBalance) < 32) {
      handleOpenModal()
    } else {
      clearAllData()
      navigate('/staking/validator-password')
    }
  }

  const handleOpenModal = () => setOpenInsufficientModal(true)
  const handleCloseModal = () => setOpenInsufficientModal(false)

  const [openLegalModal, setOpenLegalModal] = useState(false)

  const handleCloseLegalModal = () => {
    setOpenLegalModal(false)
  }

  return (
    <div className="topbar">
      <a href="https://joinstakehouse.com/" rel={'noopener noreferrer'} onClick={clearAllData}>
        <img src={Logo} alt="logo" />
      </a>
      {isConnected && (
        <div className="topbar__navMenu">
          <Link to={'/'} onClick={clearAllData}>
            <NavItem active={!pathname.includes('staking')}>My Profile</NavItem>
          </Link>
          <div className="cursor-pointer" onClick={handleCreateValidator}>
            <NavItem active={pathname.includes('staking')}>Stake</NavItem>
          </div>
          {/*  <a
            href="https://help.joinstakehouse.com/en/"
            target={'_blank'}
            rel={'noopener noreferrer'}>
            <NavItem active={false}>
              <div className="flex items-center gap-2">
                Help Center <ArrowTopRightIcon />
              </div>
            </NavItem>
          </a> */}
        </div>
      )}
      {isConnected ? (
        <div className="flex items-center gap-3">
          <ButtonWalletConnect />
        </div>
      ) : (
        <div />
      )}
      <ModalInsufficientBalance open={openInsufficientModal} onClose={handleCloseModal} />
      <ModalLegalPrivacy open={openLegalModal} onClose={handleCloseLegalModal} />
    </div>
  )
}

export default Topbar
