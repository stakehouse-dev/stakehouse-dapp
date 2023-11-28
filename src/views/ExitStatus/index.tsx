import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ApolloClient, InMemoryCache } from '@apollo/client'
import { config } from 'constants/environment'

import ArrowLeftSVG from 'assets/images/arrow-left.svg'

import {
  Button,
  DefaultModalView,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Spinner,
  Tooltip
} from 'components/shared'
import { BEACON_NODE_URL } from 'constants/chains'

import { useSDK } from 'hooks'
import { BalanceReportT } from 'types'
import { convertDateToString } from 'utils/global'
import { Stepper } from 'components/app'
import { useReportBalance } from 'hooks/useReportBalance'
import { ModalBalanceReportSuccessful } from 'components/app/Modals/ModalBalanceReportSuccessful'
import { TEligibilityStatus } from 'types/ragequit'

import { AssistantQuery } from 'graphql/queries/knot'

export const getRageQuitAssistant = async (blsKey: string | undefined) => {
  const client = new ApolloClient({
    uri: config.LSD_GRAPHQL_URL,
    cache: new InMemoryCache()
  })

  const { data: { stakehouseRageQuitAssistants } = {} } = await client.query({
    query: AssistantQuery,
    variables: {
      blsKey
    }
  })

  return stakehouseRageQuitAssistants.length > 0 ? stakehouseRageQuitAssistants[0].id : undefined
}

const ExitStatus = () => {
  const { sdk } = useSDK()
  const navigate = useNavigate()
  const { blsKey } = useParams()
  const {
    handleSubmit,
    handleReset,
    isSubmitting,
    isSubmitted,
    status,
    setSubmitted,
    isMultiRageQuit,
    setIsMultiRageQuit
  } = useReportBalance()

  const [timeLeft, setTimeLeft] = useState<number>(32 * 60)
  const [loading, setLoading] = useState(false)
  const [isBeingTopUp, setBeingTopUp] = useState(false)
  const [reportBalanceStep, setReportBalanceStep] = useState(false)
  const [error, setError] = useState('')
  const [isDeploying, setIsDeploying] = useState<boolean>(false)
  const [deployError, setDeployError] = useState('')
  const [isAssistantNotDeployed, setIsAssistantNotDeployed] = useState<boolean>(false)

  const fetchAuthenticatedReport = useCallback(async () => {
    if (sdk && blsKey) {
      setLoading(true)
      try {
        const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          blsKey
        )
        const authenticatedReport: BalanceReportT = await sdk.balanceReport.authenticateReport(
          BEACON_NODE_URL,
          finalisedEpochReport
        )

        if (authenticatedReport && authenticatedReport.report) {
          const { exitEpoch, currentCheckpointEpoch } = authenticatedReport.report
          if (exitEpoch.length < 13) {
            setTimeLeft((Number(exitEpoch) - currentCheckpointEpoch) * 32 * 12)
          } else {
            setTimeLeft(32 * 60)
          }
        }
      } catch (err) {
        console.log('fetchAuthenticatedReport error: ', err)
      }
      setLoading(false)
    }
  }, [sdk, blsKey])

  useEffect(() => {
    fetchAuthenticatedReport()
  }, [fetchAuthenticatedReport])

  const handleCloseConfirmExitValidatorModal = () => {
    handleReset()
  }

  const handleGoRageQuit = () => {
    navigate(`/ragequit/${blsKey}`)
  }

  useEffect(() => {
    const goToRageQuitIfDeployed = async () => {
      const rageQuitAssistantAddress = await getRageQuitAssistant(blsKey)
      if (rageQuitAssistantAddress) navigate(`/multiparty-ragequit/${blsKey}`)
      else setIsAssistantNotDeployed(true)
    }

    if (isMultiRageQuit) goToRageQuitIfDeployed()
  }, [isMultiRageQuit])

  const handleDeployRageQuitAssistant = async () => {
    let rageQuitAssistantAddress: any
    try {
      setIsDeploying(true)

      rageQuitAssistantAddress = await getRageQuitAssistant(blsKey)

      if (!rageQuitAssistantAddress) {
        const tx = await sdk?.multipartyRageQuit.deployRageQuitAssistant(blsKey)
        await tx.wait(3)
        rageQuitAssistantAddress = await getRageQuitAssistant(blsKey)
      }

      navigate(`/multiparty-ragequit/${blsKey}`)
    } catch (err: any) {
      console.error(err)
      if ('reason' in err) setDeployError(err.reason)
      else setDeployError(err)
    }
    setIsDeploying(false)
  }

  const isRageQuitIneligibleSETH = status === TEligibilityStatus.IneligibleSETH
  const isRageQuitIneligibleDETH = status === TEligibilityStatus.IneligibleDETH

  if (reportBalanceStep) {
    return (
      <div className="w-full flex-1">
        <div className="max-w-3xl w-full mx-auto mt-20">
          <div className="flex items-center justify-between text-2xl font-medium text-white mb-10">
            <div className="flex gap-5">
              <img src={ArrowLeftSVG} onClick={() => navigate('/')} />
              Exit Validator
            </div>
            <Stepper step={2} />
          </div>
          <div className="flex flex-col py-8 items-center border border-innerBorder rounded-2xl">
            <div className="bg-grey900 w-full py-4 px-10 rounded-lg" style={{ maxWidth: '627px' }}>
              <div className="flex gap-3 mb-7 pt-2">
                <p className="text-primary">Report Balance</p>
                <Tooltip message="Sync your dETH token balance with the consensus layer balance." />
              </div>

              <div className="flex flex-col">
                <Button
                  size="lg"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(blsKey || '')}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
        <LoadingModal
          open={isSubmitting || isDeploying}
          onClose={() => {}}
          title="Confirmation Pending"
        />
        <ModalBalanceReportSuccessful
          open={isSubmitted && status === TEligibilityStatus.Eligible}
          txHash=""
          isSubmitting={isBeingTopUp}
          onClose={handleCloseConfirmExitValidatorModal}
          onConfirm={handleGoRageQuit}
        />
        <ModalDialog
          open={isSubmitted && !isMultiRageQuit && status !== TEligibilityStatus.Eligible}
          onClose={() => setSubmitted(false)}
          controlsClosableOnly>
          <DefaultModalView
            title="Eligibility Status"
            message={`You are not eligible to withdraw your validator.  ${
              isRageQuitIneligibleSETH || isRageQuitIneligibleDETH
                ? `You do not have enough ${
                    isRageQuitIneligibleSETH ? 'sETH' : 'dETH'
                  } in your wallet.`
                : `Please top up any leakage or slashing you may occurred.`
            }`}>
            <div className="flex items-center w-full justify-center gap-2.5">
              <Button size="lg" onClick={() => navigate('/')}>
                Go to Profile
              </Button>
            </div>
          </DefaultModalView>
        </ModalDialog>

        <ModalDialog
          open={isSubmitted && isMultiRageQuit && isAssistantNotDeployed}
          onClose={() => setSubmitted(false)}>
          <DefaultModalView
            title="Multi Party Rage Quit"
            message={'A rage quit assistant needs to be deployed to continue with the rage quit.'}>
            <div className="flex items-center w-full justify-center gap-2.5">
              <Button size="lg" onClick={handleDeployRageQuitAssistant}>
                Deploy
              </Button>
            </div>
          </DefaultModalView>
        </ModalDialog>

        <ErrorModal
          open={!!deployError}
          onClose={() => {
            setDeployError('')
            setIsMultiRageQuit(false)
          }}
          title="Multi Pary Rage Quit Assistant Deployment Error"
          message={deployError}
          actionButtonContent="Try Again"
          onAction={() => {
            setDeployError('')
            setIsMultiRageQuit(false)
          }}
        />

        <ErrorModal
          open={!!error}
          onClose={() => setError('')}
          title="Eligibility Status"
          message={error}
          actionButtonContent="Try Again"
          onAction={() => setError('')}
        />
      </div>
    )
  }

  if (timeLeft !== undefined && timeLeft <= 0) {
    return (
      <div className="w-full flex-1">
        <div className="max-w-3xl w-full mx-auto mt-20">
          <div className="flex gap-5 text-2xl font-medium text-white mb-10">
            <img src={ArrowLeftSVG} onClick={() => navigate('/')} />
            Exit Validator
          </div>
          <div className="flex py-8 flex-col items-center border border-innerBorder rounded-2xl">
            <div
              className="bg-grey950 w-full py-4 px-10 rounded-lg flex flex-col items-center"
              style={{ maxWidth: '627px' }}>
              <p className="text-primary font-semibold mb-10">Your waiting window is over!</p>
              <p className="text-grey700 font-medium mb-2">Estimated Time remaining</p>
              <p className="text-white text-2xl font-medium mb-4">00 : 00 : 00</p>
              <Button size="lg" onClick={() => setReportBalanceStep(true)}>
                Withdraw Validator
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1">
      <div className="max-w-3xl w-full mx-auto mt-20">
        <div className="flex gap-5 text-2xl font-medium text-white mb-10">
          <img src={ArrowLeftSVG} onClick={() => navigate('/')} />
          Exit Validator
        </div>
        <div className="flex py-8 flex-col items-center border border-innerBorder rounded-2xl">
          <div
            className="bg-grey950 w-full py-4 px-10 rounded-lg flex flex-col items-center"
            style={{ maxWidth: '627px' }}>
            {loading ? (
              <Spinner size={36} />
            ) : (
              <>
                <p className="text-primary font-semibold mb-5">
                  Your withdrawal process has started
                </p>
                <p className="text-grey700 font-medium text-center mb-8">
                  {`You'll need to continue running your validator`}
                  <br /> during the withdrawal queue.
                </p>
                <p className="text-grey700 font-medium mb-2">Estimated Time remaining</p>
                <p className="text-white text-2xl font-medium mb-4">
                  {timeLeft ? convertDateToString(timeLeft) : '-- : -- : --'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default ExitStatus
