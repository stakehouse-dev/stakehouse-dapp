import { FC, ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentValidator } from 'hooks'

interface IProps {
  children: ReactNode
  fallbackTo?: string
  validatorIdParamName?: string
}

const ValidatorMustBeStakehouseMember: FC<IProps> = ({
  children,
  fallbackTo = '',
  validatorIdParamName = 'id'
}) => {
  const navigate = useNavigate()

  const { validator } = useCurrentValidator(validatorIdParamName)

  useEffect(() => {
    if (validator && !validator?.stakeHouseMetadata) {
      navigate(fallbackTo || `/details/${validator.id}`, { replace: true })
    }
  }, [validator])

  return <>{children}</>
}

export default ValidatorMustBeStakehouseMember
