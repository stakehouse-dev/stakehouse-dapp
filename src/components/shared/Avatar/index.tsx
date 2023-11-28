import { FC } from 'react'

import './styles.scss'

interface IProps {
  src: string
  size?: number
}

const Avatar: FC<IProps> = ({ src, size }) => {
  return (
    <div className="avatar" style={{ width: size, height: size }}>
      <img src={src} alt="av" />
    </div>
  )
}

export default Avatar
