import client from 'graphql/client'
import { KnotDepositorQuery } from 'graphql/queries/knot'

export const isLSDValidator = async (blsKey: string, userAddress: string) => {
  const { data: { knot } = {} } = await client.query({
    query: KnotDepositorQuery,
    variables: {
      blsKey
    }
  })

  return knot.depositor.toLowerCase() != userAddress.toLowerCase()
}
