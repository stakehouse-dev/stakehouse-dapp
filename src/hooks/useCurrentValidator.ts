import { useUser } from './useUser'
import { useParams } from 'react-router-dom'

export function useCurrentValidator(idParamName: string = 'id') {
  const { getValidatorById, isValidatorsDataLoading } = useUser()
  const params = useParams()

  const validatorId = params[idParamName] as string
  const currentValidator = getValidatorById(validatorId as string)

  return { validator: currentValidator, isValidatorDataLoading: isValidatorsDataLoading }
}
