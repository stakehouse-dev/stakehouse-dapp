import { FC, useState, useEffect } from 'react'
import {
  ModalDialog,
  DefaultModalView,
  LoadingModalView,
  Button,
  CompletedTxView,
  ErrorModalView
} from 'components/shared'
import { useAccount, useBalance } from 'wagmi'
import { BigNumber } from 'ethers'
import { ValidatorT } from 'types'
import { weiToEthNum, cutDecimals, notifyHash, noty, isTxRejectedByUser } from 'utils/global'
import { useUser, useSDK, useNetworkBasedLinkFactories } from 'hooks'
import { config } from 'constants/environment'

export interface ModalIsolateDETHProps {
  open: boolean
  onClose: () => void
  validator: ValidatorT | null | undefined
}

export const ModalIsolateDETH: FC<ModalIsolateDETHProps> = ({ open, onClose, validator }) => {
  const { address } = useAccount()
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { isValidatorsDataLoading, refetchUserData, knotsData } = useUser()
  const [isIsolateTxProcessing, setIsIsolateTxProcessing] = useState(false)
  const [isolateResult, setIsolateResult] = useState<{ hash: string } | null>(null)
  const [isolateError, setIsolateError] = useState('')
  const [dEthRequiredForIsolation, setDEthRequiredForIsolation] = useState(0)
  const [isRequiredDETHLoading, setIsRequiredDETHLoading] = useState(true)

  const { data: { formatted: dETHBalance } = {}, isLoading: isBalanceLoading } = useBalance({
    address,
    formatUnits: 'ether',
    chainId: config.networkId,
    token: config.dethTokenAddress as `0x${string}`
  })

  const isEligibilityCheckLoading =
    isValidatorsDataLoading || isBalanceLoading || isRequiredDETHLoading

  const isDEthBalanceSufficientForIsolate = Number(dETHBalance) >= dEthRequiredForIsolation

  const isIsolateEligible = (() => {
    if (isEligibilityCheckLoading) return false
    return isDEthBalanceSufficientForIsolate
  })()

  const isolateTxLink = (() => {
    if (!isolateResult) return ''
    return makeEtherscanLink(isolateResult.hash)
  })()

  useEffect(() => {
    if (!isBalanceLoading && sdk && validator) {
      loadDEthRequiredForIsolation()
    }
  }, [sdk, validator, isBalanceLoading])

  async function loadDEthRequiredForIsolation() {
    if (!sdk || !validator) return

    try {
      setIsRequiredDETHLoading(true)
      const response = await sdk.utils.dETHRequiredForIsolation(validator.id)
      setDEthRequiredForIsolation(weiToEthNum(BigNumber.from(response)))
    } catch (err) {
      console.error(err)
    } finally {
      setIsRequiredDETHLoading(false)
    }
  }

  async function handleIsolateDETH() {
    if (!sdk || !validator) return

    try {
      setIsIsolateTxProcessing(true)

      const newIndexId = knotsData?.length ? knotsData[0].id : 0

      const tx = await sdk.depositAndIsolateKnotIntoIndex(
        validator.stakeHouseMetadata?.id,
        validator.id,
        newIndexId
      )

      notifyHash(tx.hash)
      await tx.wait(1)

      refetchUserData(tx, 1)

      setIsolateError('')
      setIsolateResult(tx)
    } catch (err) {
      if (!isTxRejectedByUser(err)) {
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: dETH isolate failed'
        setIsolateError(errorMessage)
        noty(errorMessage)
      }
    } finally {
      setIsIsolateTxProcessing(false)
    }
  }

  function handleClose() {
    setIsolateResult(null)
    setIsolateError('')
    onClose()
  }

  const ineligibleMessageContent = (
    <div className="flex flex-col gap-2 text-grey300">
      <div>
        You are&nbsp;
        <span className="text-danger">not eligible</span>
        &nbsp;to isolate dETH.
      </div>
      {!isDEthBalanceSufficientForIsolate && (
        <>
          <div style={{ maxWidth: '250px', margin: 'auto' }}>
            You do not have enough dETH in your wallet.
          </div>
          <div className="flex items-center justify-center gap-2 text-white font-medium">
            dETH required: {cutDecimals(dEthRequiredForIsolation, 4)}
          </div>
        </>
      )}
    </div>
  )

  return (
    <ModalDialog open={open} onClose={handleClose}>
      {isIsolateTxProcessing ? (
        <LoadingModalView title="Confirmation Pending" />
      ) : isolateError ? (
        <ErrorModalView
          title="Failed to isolate dETH"
          message={isolateError}
          actionButtonContent="Retry"
          onAction={handleIsolateDETH}
        />
      ) : isolateResult ? (
        <CompletedTxView title="Isolate dETH Confirmed" txLink={isolateTxLink} />
      ) : (
        <DefaultModalView title="Isolate dETH" loading={isEligibilityCheckLoading}>
          {isIsolateEligible ? (
            <Button size="lg" style={{ minWidth: '270px' }} onClick={handleIsolateDETH}>
              Continue
            </Button>
          ) : (
            ineligibleMessageContent
          )}
        </DefaultModalView>
      )}
    </ModalDialog>
  )
}
