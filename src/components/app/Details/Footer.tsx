import { FC, useState, useEffect } from 'react'
import {
  ModalRageQuitEligibility,
  ModalTopUp,
  ModalWithdrawDETH,
  ModalIsolateDETH,
  ModalDecryptEligibility,
  ModalReportBalance,
  ModalApproveMint
} from 'components/app/Modals'
import {
  Button,
  DefaultModalView,
  Dropdown,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Spinner
} from 'components/shared'
import { BalanceReportT, TMenu, ValidatorLifecycleStatuses, ValidatorT } from 'types'
import { useNavigate } from 'react-router-dom'
import { useUser, useSDK } from 'hooks'
import {
  isValidatorDETHWithdrawable,
  isValidatorDerivativesMinted,
  isRageQuitted,
  handleAddTokenToWallet,
  isUnstaked
} from 'utils/validators'

import { ReactComponent as ThreeDotIcon } from 'assets/images/icon-dot-three.svg'
import { ReactComponent as WithdrawIcon } from 'assets/images/icon-withdraw.svg'
import { ReactComponent as IsolateIcon } from 'assets/images/icon-isolate.svg'
import { ReactComponent as MetamaskIcon } from 'assets/images/icon-metamask-outline.svg'
import { ReactComponent as RageQuitIcon } from 'assets/images/icon-ragequit.svg'
import { convertDateToString } from 'utils/global'
import { BEACON_NODE_URL } from 'constants/chains'
import { useAccount } from 'wagmi'
import ModalExitValidatorConfirm from '../Modals/ModalExitValidatorConfirm'
import { ModalWithdrawETHFromUnstakedValidator } from '../Modals/ModalWithdrawETHFromUnstakedValidator'
import { ModalReportWithdrawal } from '../Modals/ModalReportWithdrawal'
import { isLSDValidator as checkIfLSDValidator } from 'lib/isLSDValidator'
import { useFlaggedWallet } from 'hooks/useFlaggedWallet'
import { gql } from '@apollo/client'
import { ModalClaimFromUnstakedValidator } from '../Modals/ModalClaimFromUnstakedValidator'
import { getRageQuitAssistant } from 'views/ExitStatus'

interface DetailsFooterProps {
  validator: ValidatorT | undefined | null
  status: 'PENDING' | 'MINTABLE' | 'INDEXED' | 'MINTED' | 'WITHDRAWN' | 'RAGE QUIT' | 'UNSTAKED'
  onRefresh: () => void
}
const query = gql`
  query getLiquidStakingManager($blsKey: ID!) {
    lsdvalidators(where: { id: $blsKey }) {
      smartWallet {
        liquidStakingNetwork {
          id
        }
      }
    }
  }
`

const DetailsFooter: FC<DetailsFooterProps> = ({ validator, status, onRefresh }) => {
  const isFlagged = useFlaggedWallet()
  const navigate = useNavigate()
  const { sdk } = useSDK()
  const { knotsData, validators, userAddress } = useUser()
  const { connector: activeConnector } = useAccount()

  const [openModal, setOpenModal] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [openMintModal, setOpenMintModal] = useState(false)
  const [isRageQuitModalOpen, setIsRageQuitModalOpen] = useState(false)
  const [isExitValidatorModal, setIsExitValidatorModal] = useState(false)
  const [isReportWithdrawalModalOpen, setIsReportWithdrawalModalOpen] = useState(false)
  const [isWithdrawDETHModalOpen, setIsWithdrawDETHModalOpen] = useState(false)
  const [isWithdrawETHModalOpen, setIsWithdrawETHModalOpen] = useState(false)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showOpenReportModal, setShowOpenReportModal] = useState(false)
  const [isIsolateDETHModalOpen, setIsIsolateDETHModalOpen] = useState(false)
  const [dEthBalanceInIndex, setDEthBalanceInIndex] = useState('0')
  const [isDecryptEligibilityModalOpen, setIsDecryptEligibilityModalOpen] = useState(false)
  const [isLSDValidator, setLSDValidator] = useState(false)

  const [isReadyToQuit, setIsReadyToQuit] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEpochLoading, setIsEpochLoading] = useState<boolean>(false)

  const [waitUnstakeModal, setWaitUnstakeModal] = useState(0)
  const [isUnstakable, setUnstakable] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false)
  const [isClaimed, setIsClaimed] = useState<boolean>(false)
  const [exitEpoch, setExitEpoch] = useState<string>()

  useEffect(() => {
    const checkIfClaimed = async () => {
      const rageQuitAssistantAddress = await getRageQuitAssistant(validator?.id)
      if (rageQuitAssistantAddress) {
        const amount = await sdk?.multipartyRageQuit.nodeOperatorClaimPreview(
          rageQuitAssistantAddress,
          userAddress
        )

        if (amount.toString() == '0') setIsClaimed(true)
        else setIsClaimed(false)
      }
    }
    if (validator && sdk) checkIfClaimed()
  }, [validator, sdk])

  useEffect(() => {
    const fetchIsLSD = async () => {
      if (validator && sdk) {
        if (validator.id) {
          const isLSD = await checkIfLSDValidator(validator.id, userAddress)
          if (isLSD) {
            setLSDValidator(true)
          } else {
            setLSDValidator(false)
          }
        } else {
          setLSDValidator(false)
        }
      }
    }
    fetchIsLSD()

    const fetchAuthenticatedReport = async () => {
      if (sdk && validator) {
        setIsLoading(true)
        try {
          const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
            BEACON_NODE_URL,
            validator.id
          )
          setExitEpoch(finalisedEpochReport.exitEpoch)
          const authenticatedReport: BalanceReportT = await sdk.balanceReport.authenticateReport(
            BEACON_NODE_URL,
            finalisedEpochReport
          )

          if (authenticatedReport && authenticatedReport.report) {
            const { exitEpoch, currentCheckpointEpoch } = authenticatedReport.report

            if (
              Number(exitEpoch) - currentCheckpointEpoch <= 0 &&
              exitEpoch != '18446744073709551615'
            )
              setIsReadyToQuit(true)
          }
        } catch (err) {
          console.log('fetchAuthenticatedReport error: ', err)
        }

        setIsLoading(false)
      }
    }
    fetchAuthenticatedReport()
  }, [sdk, validator])

  const handleOpenReportModal = async () => {
    setShowOpenReportModal(true)
  }
  const handleCloseReportModal = () => {
    setShowOpenReportModal(false)
  }
  const handleOpenTopUpModal = async () => {
    // checking if address is flagged
    const flagged = await isFlagged()
    if (flagged) {
      setOpenModal(true)
      return
    }
    setShowTopUpModal(true)
  }
  const handleCloseTopUpModal = () => {
    setShowTopUpModal(false)
    onRefresh()
  }

  const handleWithdraw = async () => {
    // checking if address is flagged
    const flagged = await isFlagged()
    if (flagged) {
      setOpenModal(true)
      return
    }
    setIsWithdrawDETHModalOpen(true)
  }

  const handleOpenMintModal = () => setOpenMintModal(true)
  const handleCloseMintModal = () => {
    onRefresh()
    setOpenMintModal(false)
  }

  const handleExitValidator = () => {
    navigate(`/exit-validator/${validator?.id}`)
  }

  const isValidatorFunctional = !!validator && isValidatorDerivativesMinted(validator)
  const topUpAvailable =
    validator &&
    Number(validator.totalCollateralizedSLOTInVaultFormatted) < 4 &&
    !isRageQuitted(validator) &&
    validator.lifecycleStatus === ValidatorLifecycleStatuses.derivativesMinted
  const reportBalanceAvailable =
    validator &&
    !isRageQuitted(validator) &&
    validator.lifecycleStatus === ValidatorLifecycleStatuses.derivativesMinted

  const options: TMenu[] =
    activeConnector?.name === 'WalletConnect'
      ? [
          {
            id: 0,
            label: 'Withdraw dETH',
            icon: <WithdrawIcon />,
            disabled: !isValidatorFunctional || !isValidatorDETHWithdrawable(validator, knotsData),
            onClick: () => setIsWithdrawDETHModalOpen(true)
          },
          {
            id: 1,
            label: 'Isolate dETH',
            icon: <IsolateIcon />,
            disabled: !isValidatorFunctional || dEthBalanceInIndex !== '0',
            onClick: () => setIsIsolateDETHModalOpen(true)
          },
          {
            id: 3,
            label: 'Exit Validator',
            disabled: !isValidatorFunctional,
            icon: <RageQuitIcon />,
            onClick: () =>
              isReadyToQuit ? setIsReportWithdrawalModalOpen(true) : setIsExitValidatorModal(true)
          }
          // {
          //   id: 4,
          //   label: 'Recover Validator',
          //   icon: <ArrowsLoopIcon />,
          //   disabled:
          //     !isValidatorFunctional ||
          //     isRageQuitted(validator) ||
          //     cipStatus !== TCipStatus.FullySecured,
          //   onClick: () => setIsDecryptEligibilityModalOpen(true)
          // }
        ]
      : [
          {
            id: 0,
            label: 'Withdraw dETH',
            icon: <WithdrawIcon />,
            disabled: !isValidatorFunctional || !isValidatorDETHWithdrawable(validator, knotsData),
            onClick: () => setIsWithdrawDETHModalOpen(true)
          },
          {
            id: 1,
            label: 'Isolate dETH',
            icon: <IsolateIcon />,
            disabled: !isValidatorFunctional || dEthBalanceInIndex !== '0',
            onClick: () => setIsIsolateDETHModalOpen(true)
          },
          {
            id: 2,
            label: 'Add dETH to MetaMask',
            icon: <MetamaskIcon />,
            onClick: () => handleAddTokenToWallet()
          },
          {
            id: 4,
            label: 'Exit Validator',
            disabled: !isValidatorFunctional,
            icon: <RageQuitIcon />,
            onClick: () =>
              isReadyToQuit
                ? navigate(`/exit-validator/${validator?.id}/status`)
                : setIsExitValidatorModal(true)
          }
          // {
          //   id: 5,
          //   label: 'Recover Validator',
          //   icon: <ArrowsLoopIcon />,
          //   disabled:
          //     !isValidatorFunctional ||
          //     isRageQuitted(validator) ||
          //     cipStatus !== TCipStatus.FullySecured,
          //   onClick: () => setIsDecryptEligibilityModalOpen(true)
          // }
        ]

  useEffect(() => {
    if (sdk && validator) {
      loadDEthBalanceInIndex()
      loadCipStatus()
    }
  }, [sdk, validator, validators])

  const handleClaim = async () => {
    setIsClaimModalOpen(true)
  }
  const handleWithdrawETH = async () => {
    if (validator) {
      setIsEpochLoading(true)
      const finalisedEpochReport = await sdk?.balanceReport.getFinalisedEpochReport(
        BEACON_NODE_URL,
        validator.id
      )
      const authenticatedReport: BalanceReportT = await sdk?.balanceReport.authenticateReport(
        BEACON_NODE_URL,
        finalisedEpochReport
      )

      const { withdrawalEpoch, currentCheckpointEpoch, activeBalance } = authenticatedReport.report

      setIsEpochLoading(false)
      if (Number(withdrawalEpoch) - currentCheckpointEpoch > 0) {
        return setWaitUnstakeModal((Number(withdrawalEpoch) - currentCheckpointEpoch) * 32 * 12)
      }

      if (Number(activeBalance) !== 0) {
        return setUnstakable(true)
      }

      setIsWithdrawETHModalOpen(true)
    }
  }

  async function loadDEthBalanceInIndex() {
    if (!sdk || !validator) return
    const response = await sdk.utils.getDETHBalanceInIndex(validator.id)
    setDEthBalanceInIndex(response.toString())
  }

  async function loadCipStatus() {
    if (!sdk || !validator) return

    try {
      const response = await sdk.cip.getDecryptionState(validator.id)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <div className="details-footer">
        <div className="details-footer__header">
          <div className="details-footer__title">Utilities</div>
          {isLoading ? (
            <Spinner size={24} />
          ) : (
            <Dropdown options={options} disabled={isLSDValidator}>
              <div className={`details-footer__menu-btn${isLSDValidator ? '--disabled' : ''}`}>
                <ThreeDotIcon />
              </div>
            </Dropdown>
          )}
        </div>

        {status === 'MINTABLE' && (
          <Button variant="primary" onClick={handleOpenMintModal}>
            Mint Now
          </Button>
        )}

        {isValidatorFunctional && isValidatorDETHWithdrawable(validator, knotsData) && (
          <Button
            variant="primary"
            disabled={isLSDValidator}
            onClick={() => !isRageQuitted(validator) && setIsWithdrawDETHModalOpen(true)}>
            Ready to Withdraw dETH
          </Button>
        )}
        {isRageQuitted(validator) && (
          <Button variant="primary" disabled={isLSDValidator} onClick={handleWithdrawETH}>
            Withdraw ETH from Unstaked Validator
          </Button>
        )}

        {isUnstaked(validator) && (
          <Button variant="primary" disabled={isLSDValidator || isClaimed} onClick={handleClaim}>
            Claim
          </Button>
        )}

        <div className="details-footer__btns">
          <Button
            variant="secondary"
            disabled={
              isSubmitting || !reportBalanceAvailable || exitEpoch != '18446744073709551615'
            }
            style={{ flex: 1, color: '#fff' }}
            onClick={handleOpenReportModal}>
            Report Balance
          </Button>
          <Button
            variant="secondary"
            disabled={!topUpAvailable || isSubmitting}
            style={{ flex: 1, color: '#fff' }}
            onClick={handleOpenTopUpModal}>
            Top Up
          </Button>
        </div>
      </div>

      <ModalExitValidatorConfirm
        open={isExitValidatorModal}
        onClose={() => setIsExitValidatorModal(false)}
        onConfirm={() => handleExitValidator()}
      />
      <ModalRageQuitEligibility
        open={isRageQuitModalOpen}
        validator={validator}
        onClose={() => setIsRageQuitModalOpen(false)}
      />

      <ModalWithdrawDETH
        open={isWithdrawDETHModalOpen}
        onClose={() => setIsWithdrawDETHModalOpen(false)}
        withdrawValidatorId={validator?.id}
      />

      <ModalWithdrawETHFromUnstakedValidator
        open={isWithdrawETHModalOpen}
        onClose={() => setIsWithdrawETHModalOpen(false)}
        withdrawValidatorId={validator?.id}
      />
      <ModalClaimFromUnstakedValidator
        open={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        withdrawValidatorId={validator?.id}
      />

      <ModalTopUp open={showTopUpModal} onClose={handleCloseTopUpModal} validator={validator} />

      <ModalReportBalance
        open={showOpenReportModal}
        onClose={handleCloseReportModal}
        validator={validator}
      />

      <ModalIsolateDETH
        open={isIsolateDETHModalOpen}
        validator={validator}
        onClose={() => setIsIsolateDETHModalOpen(false)}
      />

      {/* <ModalDecryptEligibility
        open={isDecryptEligibilityModalOpen}
        validator={validator}
        onClose={() => setIsDecryptEligibilityModalOpen(false)}
      /> */}

      <ModalApproveMint
        open={openMintModal}
        onClose={handleCloseMintModal}
        validator={validator!}
      />

      <ModalReportWithdrawal
        validator={validator}
        open={isReportWithdrawalModalOpen}
        onClose={() => setIsReportWithdrawalModalOpen(false)}
      />

      <ModalDialog
        open={waitUnstakeModal > 0}
        onClose={() => setWaitUnstakeModal(0)}
        controlsClosableOnly>
        <DefaultModalView title="Withdrawal in Progress">
          <div className="flex flex-col items-center">
            <p className="text-primary font-semibold mb-5">Your withdrawal process has started</p>
            <p className="text-grey700 font-medium text-center mb-8">
              {`You'll need to continue running your validator`}
              <br /> during the withdrawal queue.
            </p>
            <p className="text-grey700 font-medium mb-2">Estimated time remaining</p>
            <p className="text-white text-2xl font-medium mb-2">
              {waitUnstakeModal ? convertDateToString(waitUnstakeModal) : '-- : -- : --'}
            </p>
          </div>
        </DefaultModalView>
      </ModalDialog>

      <ErrorModal
        open={isUnstakable}
        onClose={() => setUnstakable(false)}
        message={
          'Withdrawal to Stakehouse Protocol not yet complete by Consensus Layer. Please try again later'
        }
        title="Error"
        actionButtonContent="Ok"
        onAction={() => setUnstakable(false)}
      />
      <LoadingModal
        title="Checking withdrawal status"
        onClose={() => setIsEpochLoading(false)}
        open={isEpochLoading}
      />
    </>
  )
}

export default DetailsFooter
