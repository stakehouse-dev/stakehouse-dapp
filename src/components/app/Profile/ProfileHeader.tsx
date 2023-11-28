import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useBalance } from 'wagmi'
import { BigNumber } from 'ethers'

import { ModalWithdrawDETH, ModalInsufficientBalance } from 'components/app/Modals'
import { Button, Dropdown } from 'components/shared'

import { useSDK, useUser } from 'hooks'
import { cutDecimals, weiToEthNum } from 'utils/global'
import { handleAddTokenToWallet, isValidatorDETHWithdrawable } from 'utils/validators'
import { config } from 'constants/environment'
import { TMenu } from 'types'

import SettingIcon from 'assets/images/icon-settings.svg'
import { ReactComponent as WithdrawIcon } from 'assets/images/icon-withdraw.svg'
import { ReactComponent as MetamaskIcon } from 'assets/images/icon-metamask-outline.svg'
import './styles.scss'

const ProfileHeader: FC = () => {
  const [openInsufficientModal, setOpenInsufficientModal] = useState(false)
  const [isWithdrawDETHModalOpen, setIsWithdrawDETHModalOpen] = useState(false)
  const [validatorsCreatedCount, setValidatorsCreatedCount] = useState(0)
  const [validatorsJoinedCount, setValidatorsJoinedCount] = useState(0)
  const [housesCreatedCount, setHousesCreatedCount] = useState(0)

  const { validators, knotsData } = useUser()
  const { sdk } = useSDK()
  const { connector: activeConnector } = useAccount()

  const navigate = useNavigate()
  const account = useAccount()
  const { data: { formatted: dETHBalance } = {} } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    chainId: config.networkId,
    token: config.dethTokenAddress as `0x${string}`
  })
  const { data: { formatted: ethBalance } = {} } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    chainId: config.networkId
  })

  useEffect(() => {
    const fetchValidatorCreated = async () => {
      if (sdk && account) {
        const validatorCreatedResponse = await sdk.wizard.getCumulativeValidatorsCreated(
          account?.address?.toLowerCase() || ''
        )
        setValidatorsCreatedCount(validatorCreatedResponse.length)

        const validatorJoinedResponse = await sdk.wizard.getCumulativeHouseJoined(
          account?.address?.toLowerCase() || ''
        )
        setValidatorsJoinedCount(validatorJoinedResponse.length)

        const housesCreatedResponse = await sdk.wizard.getCumulativeHouseCreated(
          account?.address?.toLowerCase() || ''
        )
        setHousesCreatedCount(housesCreatedResponse.length)
      }
    }
    fetchValidatorCreated()
  }, [sdk, account])

  const withdrawEligibleValidators = validators.filter((v) =>
    isValidatorDETHWithdrawable(v, knotsData, false, true)
  )

  const totalWithdrawableDETH = (() => {
    return withdrawEligibleValidators.reduce(
      (prev, current) => prev + Number(weiToEthNum(BigNumber.from(current.totalDETHMinted))),
      0
    )
  })()

  const menuOptions: TMenu[] =
    activeConnector?.name === 'WalletConnect'
      ? [
          {
            id: 0,
            label: 'Withdraw all dETH',
            icon: <WithdrawIcon />,
            disabled: totalWithdrawableDETH <= 0,
            onClick: () => setIsWithdrawDETHModalOpen(true)
          }
        ]
      : [
          {
            id: 0,
            label: 'Withdraw all dETH',
            icon: <WithdrawIcon />,
            disabled: totalWithdrawableDETH <= 0,
            onClick: () => setIsWithdrawDETHModalOpen(true)
          },
          {
            id: 2,
            label: 'Add dETH to MetaMask',
            icon: <MetamaskIcon />,
            onClick: () => handleAddTokenToWallet()
          }
        ]
  const handleCreateValidator = () => {
    if (Number(ethBalance) < 32) {
      handleOpenModal()
    } else {
      navigate('/staking/validator-password')
    }
  }

  const handleOpenModal = () => setOpenInsufficientModal(true)
  const handleCloseModal = () => setOpenInsufficientModal(false)

  return (
    <div className="profile-header">
      <div className="profile-header__container">
        <div className="profile-header__info-card">
          <div>
            <span>Validators</span>
            <span>{validatorsCreatedCount || '--'}</span>
          </div>
          <div>
            <span>Stakehouses Joined</span>
            <span>{validatorsJoinedCount || '--'}</span>
          </div>
          <div>
            <span> Stakehouses Created</span>
            <span>{housesCreatedCount || '--'}</span>
          </div>
          <div>
            <span>dETH Wallet Balance</span>
            <span>{dETHBalance ? cutDecimals(dETHBalance, 4) : '--'}</span>
          </div>
        </div>
        <div className="profile-header__btn-group">
          <Button variant="primary" onClick={handleCreateValidator}>
            Create a Validator
          </Button>
          <Dropdown options={menuOptions}>
            <div className="profile-header__setting">
              <img src={SettingIcon} alt="setting" />
            </div>
          </Dropdown>
        </div>
      </div>
      <ModalInsufficientBalance open={openInsufficientModal} onClose={handleCloseModal} />
      <ModalWithdrawDETH
        open={isWithdrawDETHModalOpen}
        onClose={() => setIsWithdrawDETHModalOpen(false)}
        indexedOnly
      />
    </div>
  )
}

export default ProfileHeader
