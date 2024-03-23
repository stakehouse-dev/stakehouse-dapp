import { FC, useEffect, useMemo, useState } from 'react'
import { BSChart, BSChartContainer } from '../Chart'
import { ReactComponent as ArrowIcon } from 'assets/images/icon-arrow-top-right.svg'
import './IndexChart.scss'
import { mainnet, useNetwork } from 'wagmi'
import { API_ENDPOINT, NETWORK } from '../../../constants'

const IndexChart: FC<{ indexId: string }> = ({ indexId }) => {
  const [data, setData] = useState<any>()
  const [isLoading, setLoading] = useState(false)
  const [openIndexData, setOpenIndexData] = useState<any>()
  const [currentEpoch, setCurrentEpoch] = useState(1575)
  const { chain: activeChain } = useNetwork()

  useEffect(() => {
    const fetchChatData = async () => {
      if (!indexId) return

      setLoading(true)
      try {
        const myHeaders = new Headers()
        myHeaders.append('accept', 'application/json')

        const requestOptions = {
          method: 'GET',
          headers: myHeaders
        }

        const result = await fetch(
          `${
            API_ENDPOINT[activeChain?.id === mainnet.id ? NETWORK.MAINNET : NETWORK.TESTNET]
          }/averageIndexAPR?index=${indexId}&epochs=1575`,
          requestOptions as any
        )
        const data = await result.json()
        if (indexId !== '0') {
          setData(data.indexAPR)
          setOpenIndexData(data.openIndexAPR)
        } else {
          setData(data.openIndexAPR)
          setOpenIndexData(data.openIndexAPR)
        }
      } catch (err) {
        console.log('error: ', err)
      }
      setLoading(false)
    }

    fetchChatData()
  }, [indexId])

  const chartTitle = 'Index Yield'
  const chartMinHeight = '350px'
  const labels = useMemo(() => {
    if (data) {
      return Object.keys(data).slice(-currentEpoch)
    }

    return []
  }, [data, currentEpoch])

  const lines = useMemo(() => {
    if (data && openIndexData) {
      if (indexId !== '0') {
        return [
          {
            values: Object.values(data).slice(-currentEpoch),
            color: '#00ed78',
            name: `Index ${indexId}`,
            filled: true
          },
          {
            values: Object.values(openIndexData).slice(-currentEpoch),
            color: '#FFC149',
            name: 'Open Index',
            filled: false
          }
        ]
      } else {
        return [
          {
            values: Object.values(data).slice(-currentEpoch),
            color: '#00ed78',
            name: `Open Index`,
            filled: true
          }
        ]
      }
    }

    return []
  }, [data, openIndexData, currentEpoch])

  const currentAPR = useMemo(() => {
    if (lines && lines.length > 0) {
      return lines[0].values[lines[0].values.length - 1] as number
    }

    return 0
  }, [lines])

  if (isLoading) {
    return <div className="table__empty text-sm">Loading chart data...</div>
  }

  if (!data || Object.keys(data).length === 0) {
    return <div className="table__empty text-sm">No chart data</div>
  }

  return (
    <BSChartContainer
      title={chartTitle}
      currentEpoch={currentEpoch}
      currentAPR={currentAPR}
      onSetCurrentEpoch={setCurrentEpoch}>
      <BSChart labels={labels} lines={lines} xLabel="" yLabel="" minHeight={chartMinHeight} />
      <div className="linkWrapper">
        <a
          className="link"
          href={`https://joinstakehouse.com/monitoring/index/${indexId}?network=${
            activeChain?.id === mainnet.id ? 'mainnet' : 'goerli'
          }`}
          target="_blank"
          rel="noreferrer">
          Advanced View
          <ArrowIcon />
        </a>
      </div>
    </BSChartContainer>
  )
}

export default IndexChart
