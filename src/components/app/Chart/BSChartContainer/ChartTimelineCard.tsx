import { FC, useMemo } from 'react'

import ChartTimelineButton from './ChartTimelineButton'

interface ChartTimelineCardProps {
  currentEpoch: number
  onSetCurrentEpoch: (value: number) => void
}

type Button = {
  name: string
  value: number
  isActive: boolean
}

const ChartTimelineCard: FC<ChartTimelineCardProps> = ({ currentEpoch, onSetCurrentEpoch }) => {
  const buttons: Button[] = useMemo(
    () => [
      {
        name: '1H',
        value: 9,
        isActive: currentEpoch === 9
      },
      {
        name: '1D',
        value: 225,
        isActive: currentEpoch === 225
      },
      {
        name: '1W',
        value: 1575,
        isActive: currentEpoch === 1575
      }
    ],
    [currentEpoch]
  )

  const handleSelection = (value: number) => {
    onSetCurrentEpoch(value)
  }

  return (
    <div className="flex items-center p-1 w-38 h-11 bg-black rounded-lg gap-1">
      {buttons.map(({ name, isActive, value }, index) => (
        <ChartTimelineButton
          key={index}
          text={name}
          isActive={isActive}
          onActive={() => handleSelection(value)}
        />
      ))}
    </div>
  )
}

export default ChartTimelineCard
