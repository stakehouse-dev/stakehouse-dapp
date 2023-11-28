import { FC, useState, useEffect } from 'react'
import { ModalDialog, DefaultModalView, Button, ErrorModalView, Spinner } from 'components/shared'
import { Link } from 'react-router-dom'
import { useSDK } from 'hooks'
import { BigNumber } from 'ethers'
import { useAccount } from 'wagmi'
import { ValidatorT } from 'types'
import { checkRageQuitEligibility } from 'lib/ragequit'
import { noty, weiToEthNum, cutDecimals } from 'utils/global'
import { TEligibilityStatus } from 'types/ragequit'

export interface ModalRageQuitEligibilityProps {
  open: boolean
  validator: ValidatorT | undefined | null
  onClose: () => void
}

const ModalRageQuitEligibility: FC<ModalRageQuitEligibilityProps> = ({
  open,
  validator,
  onClose
}) => {
  const { sdk } = useSDK()
  const account = useAccount()
  const [eligibilityCheckResult, setEligibilityCheckResult] = useState<TEligibilityStatus>(
    TEligibilityStatus.Ineligible
  )
  const [isEligibilityCheckLoading, setIsEligibilityCheckLoading] = useState(true)

  const validatorId = validator?.id || ''
  const isRageQuitEligible = eligibilityCheckResult === TEligibilityStatus.Eligible
  const isRageQuitIneligible = eligibilityCheckResult.includes('ineligible')
  const isRageQuitIneligibleSETH = eligibilityCheckResult === TEligibilityStatus.IneligibleSETH
  const isRageQuitIneligibleDETH = eligibilityCheckResult === TEligibilityStatus.IneligibleDETH
  const isEligibilityCheckError = eligibilityCheckResult === TEligibilityStatus.Error

  const [isDETHRequiredToRageQuitLoading, setIsDETHRequiredToRageQuitLoading] = useState(true)
  const [dETHRequiredToRageQuit, setDETHRequiredToRageQuit] = useState('')

  const isLoading = (() => {
    return !validator || isEligibilityCheckLoading
  })()

  const rageQuitMessage = (() => {
    if (isLoading) return ''

    if (isRageQuitIneligible) {
      return (
        <div className="flex flex-col gap-2">
          <div>
            You are&nbsp;
            <span className="text-danger">not eligible</span>
            &nbsp;to Rage Quit.
          </div>
          {(isRageQuitIneligibleSETH || isRageQuitIneligibleDETH) && (
            <div style={{ maxWidth: '250px', margin: 'auto' }}>
              You do not have enough {isRageQuitIneligibleSETH ? 'sETH' : 'dETH'} in your wallet.
            </div>
          )}
          {isRageQuitIneligibleDETH && (
            <div className="flex items-center justify-center gap-2 text-white font-medium">
              dETH required:{' '}
              {isDETHRequiredToRageQuitLoading ? <Spinner size={16} /> : dETHRequiredToRageQuit}
            </div>
          )}
          <div>
            <a
              href="https://help.joinstakehouse.com/en/articles/6206858-how-do-i-leave-stakehouse"
              target="_blank"
              className="text-primary transition hover:opacity-75"
              rel="noreferrer">
              Learn more
            </a>
          </div>
        </div>
      )
    }

    return 'You are eligible to Rage Quit.'
  })()

  useEffect(() => {
    if (open && validator) {
      loadEligibilityStatus()
    }
  }, [validator, open])

  useEffect(() => {
    if (eligibilityCheckResult === TEligibilityStatus.IneligibleDETH) {
      loadDETHRequiredToRageQuit()
    }
  }, [eligibilityCheckResult])

  function handleClose() {
    setEligibilityCheckResult(TEligibilityStatus.Ineligible)
    setIsEligibilityCheckLoading(true)
    onClose()
  }

  async function loadEligibilityStatus() {
    try {
      if (!validator || !sdk || !account || !validator.stakeHouseMetadata) {
        noty('User has not joined or created a stakehouse')
        throw new Error('User has not joined or created a stakehouse')
      }

      setIsEligibilityCheckLoading(true)

      const eligibilityResult = await checkRageQuitEligibility(
        sdk,
        validator.id,
        validator.stakeHouseMetadata.id,
        account.address as string
      )

      setEligibilityCheckResult(eligibilityResult)
    } catch (err) {
      console.error(err)
      setEligibilityCheckResult(TEligibilityStatus.Error)
    } finally {
      setIsEligibilityCheckLoading(false)
    }
  }

  async function loadDETHRequiredToRageQuit(): Promise<void> {
    if (!sdk || !validator) return

    try {
      setIsDETHRequiredToRageQuitLoading(true)
      const result = await sdk.utils.dETHRequiredForIsolation(validator.id)
      setDETHRequiredToRageQuit(cutDecimals(weiToEthNum(BigNumber.from(result)), 3))
    } catch (err) {
      console.error(err)
      setDETHRequiredToRageQuit('???')
    } finally {
      setIsDETHRequiredToRageQuitLoading(false)
    }
  }

  function retryEligibilityLoading() {
    setEligibilityCheckResult(TEligibilityStatus.Ineligible)
    loadEligibilityStatus()
  }

  return (
    <ModalDialog open={open} onClose={handleClose} controlsClosableOnly>
      {isEligibilityCheckError ? (
        <ErrorModalView
          message="An error occurred while checking your eligibility. Please try again."
          actionButtonContent="Try again"
          onAction={retryEligibilityLoading}
        />
      ) : (
        <DefaultModalView title="Eligibility Status" loading={isLoading} message={rageQuitMessage}>
          <div className="flex flex-col gap-2.5">
            {isRageQuitEligible && (
              <Link to={`/ragequit/${validatorId}`}>
                <Button className="w-full" size="lg">
                  Confirm
                </Button>
              </Link>
            )}
          </div>
        </DefaultModalView>
      )}
    </ModalDialog>
  )
}

export default ModalRageQuitEligibility
