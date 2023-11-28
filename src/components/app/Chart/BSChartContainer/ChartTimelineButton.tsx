import { FC } from 'react'

interface ChartTimelineButtonProps {
  text: string
  isActive: boolean
  onActive: (state: boolean, name: string) => void
}

const ChartTimelineButton: FC<ChartTimelineButtonProps> = ({
  text,
  isActive = false,
  onActive
}) => {
  const btnColor = isActive ? 'text-primary700' : 'text-grey300'
  const btnBackgroundColor = isActive ? 'bg-primary bg-opacity-10' : 'bg-none'
  const btnFontWeight = isActive ? 'text-bold' : 'text-medium'

  const handleClick = () => {
    onActive(!isActive, text)
  }

  return (
    <button
      className={`text-sm uppercase w-full h-full border-none px-3 py-2 gap-2 rounded-lg ${btnColor} ${btnBackgroundColor} ${btnFontWeight}`}
      onClick={handleClick}>
      {text}
    </button>
  )
}

export default ChartTimelineButton
