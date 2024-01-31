import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigNumber } from 'ethers'

import StatusColumn from './StatusColumn'
import { ModalApproveMint } from '../Modals'
import { ClipboardCopy, Spinner, Tooltip } from 'components/shared'

import { useNetworkBasedLinkFactories, useSDK, useUser } from 'hooks'
import { isRageQuitted } from 'utils/validators'
import { humanReadableAddress, weiToEthNum, cutDecimals } from 'utils/global'
import { BEACON_NODE_URL } from 'constants/chains'
import { ValidatorT } from 'types'

import { ReactComponent as ArrowRightIcon } from 'assets/images/icon-arrow-right.svg'
import { ReactComponent as ArrowTopRightIcon } from 'assets/images/icon-arrow-top-right.svg'
import './styles.scss'

interface IProps {
  isLoading: boolean
  data: ValidatorT[]
  knotData: any
}

const TableValidator: FC<IProps> = ({ isLoading, data, knotData }) => {
  const navigate = useNavigate()
  const { userAddress } = useUser()
  const { makeBeaconLink } = useNetworkBasedLinkFactories()
  const { sdk } = useSDK()
  const [reports, setReports] = useState()
  const [reportsLoading, setReportsLoading] = useState<boolean>(false)

  const [selectedValidator, setSelectedValidator] = useState<ValidatorT>()

  const handleMint = (validator: ValidatorT) => {
    setSelectedValidator(validator)
  }

  function getDETHMinted(validator: ValidatorT) {
    return weiToEthNum(BigNumber.from(validator.totalDETHMinted))
  }

  function isDETHBalanceTooltipVisible(validator: ValidatorT) {
    return getDETHMinted(validator) > 0
  }

  const handleGoDetailsPage = (validatorId: string) => {
    navigate(`details/${validatorId}`)
  }

  useEffect(() => {
    const fetchEpochReports = async () => {
      setReportsLoading(true)
      const blsKeys = data.map((validator) => validator.id)

      const reports = await sdk?.balanceReport.getFinalisedEpochReportForMultipleBLSKeys(
        BEACON_NODE_URL,
        blsKeys,
        'active&status=withdrawal&status=exited'
      )

      const reportObj: any = {}

      reports.map(
        (report: any) => (reportObj['0x' + report['blsPublicKey'].toLowerCase()] = report)
      )

      setReports(reportObj)
      setReportsLoading(false)
    }

    if (data.length > 0 && sdk) fetchEpochReports()
  }, [sdk, data])

  return (
    <div className="validator">
      <table className="table table--validator">
        <thead>
          <tr>
            <th>
              <div className="flex items-center gap-1">
                Validator Address
                <Tooltip message="Your ETH validator public key." />
              </div>
            </th>
            <th>
              <div className="flex items-center gap-1">
                Stakehouse
                <Tooltip message="The name of the Stakehouse the validator is in." />
              </div>
            </th>
            <th>
              <div className="flex items-center justify-center gap-1">
                Status <Tooltip message="Derivative ETH status." />
              </div>
            </th>
            <th>
              <div className="flex items-center justify-center gap-1">
                dETH{' '}
                <Tooltip message="The amount of derivative ETH associated with this validator." />
              </div>
            </th>
            {/* <th>
              <div className="flex items-center justify-center gap-1">
                CIP Status <Tooltip message="Backup and recovery for validator keys." />
              </div>
            </th> */}
            <th>
              <div className="flex items-center justify-center gap-1">
                Details
                <Tooltip message="Details and management for your KNOT." />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            data.length > 0 &&
            !reportsLoading &&
            reports &&
            data.map((validator) => (
              <tr key={validator.id}>
                <td>
                  <div className="flex items-center gap-1">
                    <ClipboardCopy copyText={validator.id}>
                      {humanReadableAddress(validator.id, 12)}
                    </ClipboardCopy>
                    <a
                      href={makeBeaconLink(validator.id)}
                      target={'_blank'}
                      rel={'noopener noreferrer'}>
                      <ArrowTopRightIcon />
                    </a>
                  </div>
                </td>
                <td>
                  <div className="font-normal">
                    {validator.stakeHouseMetadata?.sETHTicker || '--'}
                  </div>
                </td>
                <td>
                  <div className="flex justify-center">
                    <StatusColumn
                      report={reports[validator.id.toLowerCase()]}
                      validator={validator}
                      knotData={knotData}
                      onMint={handleMint}
                    />
                  </div>
                </td>
                <td>
                  <span className="flex justify-center gap-1">
                    {isRageQuitted(validator) ? (
                      <span className="text-grey600">--</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {cutDecimals(getDETHMinted(validator), 4)}
                        <Tooltip
                          message={
                            isDETHBalanceTooltipVisible(validator) ? (
                              <>
                                View your dETH contract balance on{' '}
                                <a
                                  href={`/graphql-playground/${validator.id}/${userAddress}`}
                                  target="_blank"
                                  className="text-primary"
                                  rel="noreferrer">
                                  The Graph.
                                </a>
                              </>
                            ) : null
                          }
                        />
                      </div>
                    )}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleGoDetailsPage(validator.id)}>
                    <div className="btn-details">
                      <span className="btn-details__label">Details</span>
                      <ArrowRightIcon width={8} height={8} />
                    </div>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {(isLoading || reportsLoading) && (
        <div className="table__loading">
          <Spinner size={30} />
        </div>
      )}
      {!isLoading && data.length === 0 && <div className="table__empty">No validator found</div>}
      <ModalApproveMint
        open={!!selectedValidator}
        onClose={() => setSelectedValidator(undefined)}
        validator={selectedValidator}
      />
    </div>
  )
}

export default TableValidator
