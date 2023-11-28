import { FC, useEffect, useState } from 'react'
import {
  DefaultModalView,
  LoadingModalView,
  Button,
  CompletedTxView,
  ErrorModalView
} from 'components/shared'

import { notifyHash, noty, isTxRejectedByUser } from 'utils/global'

import { useUser, useSDK, useNetworkBasedLinkFactories } from 'hooks'

import { BEACON_NODE_URL } from 'constants/chains'
import { ModalDialogWithoutMinHeight } from 'components/shared/Modal/ModalDialogWithoutMinHeight'
import { getRageQuitAssistant } from 'views/ExitStatus'

export interface IProps {
  open: boolean
  onClose: () => void
  withdrawValidatorId?: string
  fromIndex?: boolean
  indexedOnly?: boolean
}

export const ModalClaimFromUnstakedValidator: FC<IProps> = ({
  open,
  onClose,
  withdrawValidatorId = ''
}) => {
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { isValidatorsDataLoading, validators } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [withdrawResult, setWithdrawResult] = useState<{ hash: string } | null>(null)
  const [claimError, setClaimError] = useState('')
  const [isMultiPartyRageQuit, setIsMultiPartyRageQuit] = useState<boolean>(false)
  const [rageQuitAssistantAddress, setRageQuitAssistantAddress] = useState<string>()
  const [txResults, setTxResults] = useState<any>()
  const { userAddress } = useUser()

  const txNames = [
    'Node operator Withdrawal',
    'dETH Withdrawal',
    'sETH Withdrawal',
    'Collateralised SLOT Withdrawal'
  ]

  function handleClose() {
    onClose()
  }

  useEffect(() => {
    const fetchAssistantAddress = async () => {
      setIsLoading(true)
      const rageQuitAssistantAddress = await getRageQuitAssistant(withdrawValidatorId)
      setRageQuitAssistantAddress(rageQuitAssistantAddress)

      setIsLoading(false)
    }

    fetchAssistantAddress()
  }, [])

  const handleClaim = async () => {
    setIsLoading(true)

    try {
      const res = await sdk?.multipartyRageQuit.getClaimUnstakedETH(
        rageQuitAssistantAddress,
        userAddress
      )
      const { dETH, sETH } = res

      const transactions = await Promise.all([
        sdk?.multipartyRageQuit.nodeOperatorClaimFromRageQuitAssistant(rageQuitAssistantAddress),
        sdk?.multipartyRageQuit.claimDETHFromRageQuitAssistant(rageQuitAssistantAddress, dETH),
        sdk?.multipartyRageQuit.claimSETHFromRageQuitAssistant(rageQuitAssistantAddress, sETH),
        sdk?.multipartyRageQuit.claimForCollateralisedSlotOwner(
          rageQuitAssistantAddress,
          withdrawValidatorId,
          userAddress,
          undefined
        )
      ])

      transactions.map((tx) => notifyHash(tx.hash))

      const txResults = await Promise.all(transactions.map((tx) => tx.wait()))

      console.log('txResults', txResults)
      setTxResults(txResults)
    } catch (err) {
      console.error(err)
      if (!isTxRejectedByUser(err)) {
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: Claim failed'
        setClaimError(errorMessage)
        noty(errorMessage)
      }
    }
    setIsLoading(false)
  }

  return (
    <>
      <ModalDialogWithoutMinHeight open={open} onClose={handleClose}>
        {isLoading ? (
          <LoadingModalView
            title={rageQuitAssistantAddress ? 'Confirmation Pending' : 'Loading...'}
          />
        ) : claimError ? (
          <ErrorModalView
            title="Failed to claim ETH"
            message={claimError}
            actionButtonContent="Retry"
            onAction={handleClaim}
          />
        ) : txResults ? (
          <CompletedTxView
            goToContent="Home"
            title="Success"
            txLinks={
              txResults &&
              txResults?.map((tx: any, index: number) => {
                return {
                  name: txNames[index],
                  href: makeEtherscanLink(tx.hash)
                }
              })
            }
            onGoToClick={handleClose}
            message={
              <div className="flex flex-col items-center">
                <span className="text-sm text-grey300">{`Your transactions has been processed.`}</span>
              </div>
            }
          />
        ) : (
          <DefaultModalView
            title="Claim ETH from unstaked validator"
            loading={isValidatorsDataLoading}
            className="w-full">
            {/* <div className="mb-5">
              <div className={styles.textLabel}>
                Total balance to withdraw
                <Tooltip message={<div>Withdrawing ETH to your wallet.</div>} />
              </div>
              <div className={styles.field}>
                <div className="text-white text-xl font-medium">32</div>
                <div className="flex items-center gap-2 text-white px-3 py-1 rounded-full bg-white bg-opacity-10">
                  <EthIcon />
                  ETH
                </div>
              </div>
            </div> */}
            <Button size="lg" className="w-full" onClick={handleClaim}>
              Confirm
            </Button>
          </DefaultModalView>
        )}
      </ModalDialogWithoutMinHeight>
    </>
  )
}
