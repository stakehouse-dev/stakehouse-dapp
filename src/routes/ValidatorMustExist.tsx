import { FC, ReactNode, useEffect } from 'react'
import { Navigate, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useCurrentValidator } from 'hooks'
interface IProps {
  children: ReactNode
  fallbackTo?: string
  validatorIdParamName?: string
}

const ValidatorMustExist: FC<IProps> = ({
  children,
  fallbackTo = '/',
  validatorIdParamName = 'id'
}) => {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()

  const { validator, isValidatorDataLoading } = useCurrentValidator(validatorIdParamName)
  const validatorId = params[validatorIdParamName] as string

  if (!validatorId) {
    return <Navigate to={`/`} state={{ from: location }} replace />
  }

  useEffect(() => {
    if (!isValidatorDataLoading && !validator) {
      navigate(fallbackTo, { replace: true })
    }
  }, [isValidatorDataLoading])

  return <>{children}</>
}

export default ValidatorMustExist
