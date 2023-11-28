import { FC, ReactNode } from 'react'

import ChartTimelineCard from './ChartTimelineCard'
import { Tooltip } from 'components/shared'

export interface BSChartContainerProps {
  children: ReactNode
  title: ReactNode | string
  currentEpoch: number
  currentAPR: number
  onSetCurrentEpoch: (value: number) => void
}

const BSChartContainer: FC<BSChartContainerProps> = ({
  children,
  title,
  currentEpoch,
  currentAPR,
  onSetCurrentEpoch
}) => {
  return (
    <div className="bg-black py-6 px-8 border border-grey600 rounded-2xl">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-grey700 font-medium">{title}</span>
          <span className="font-semibold text-base text-white">
            {currentAPR ? currentAPR.toLocaleString(undefined, { maximumFractionDigits: 3 }) : '0'}%
          </span>
          <Tooltip
            message={`APR of dETH within the ${title === 'Index Yield' ? 'index' : 'validator'}.`}
          />
        </div>
        <ChartTimelineCard currentEpoch={currentEpoch} onSetCurrentEpoch={onSetCurrentEpoch} />
      </div>
      <p className="text-xxs font-bold text-white">Yield%</p>
      <div className="flex-grow">{children}</div>
    </div>
  )
}

export default BSChartContainer
