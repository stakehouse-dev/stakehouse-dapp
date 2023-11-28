import EmbeddedExplorer from '@apollo/explorer'
import { config } from 'constants/environment'
import { GraphqlContext } from 'context/GraphqlContext'
import { IntrospectionQuery, buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql'
import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useSWR from 'swr'

const endpointUrl = config.GRAPHQL_URL!
interface Props {
  account: string
  id: string
  schema: string
}
function Playground({ account, id, schema }: Props) {
  useEffect(() => {
    new EmbeddedExplorer({
      target: '#embeddedExplorer',
      endpointUrl,
      // @ts-ignore — this field is definitely valid according to their docs, not sure why its not accepted here
      schema,
      initialState: {
        document: `
# We've generated a GraphQL query for you to use in this playground.
# This query will hit our subgraph and return the dETH and SLOT balances for your connected account.
# You can also explore our subgraph in its entirety with The Graph Studio here: https://thegraph.com/hosted-service/subgraph/bswap-eng/stakehouse-protocol

{
  stakehouseAccounts(where: { id: "${id}", lifecycleStatus: 3, depositor: "${account}" }) {
    id
    totalDETHMintedFormatted
    totalSLOTFormatted
    totalCollateralizedSLOTInVaultFormatted
    sETHMintedFormatted
    sETHCollateralizedAtMintingFormatted
    stakeHouseMetadata {
      id
      sETH
      sETHExchangeRateFormatted
      sETHTicker
    }
  }
}
        `,
        displayOptions: {
          showHeadersAndEnvVars: true,
          docsPanelState: 'closed'
        }
      }
    })
  })

  return <div id="embeddedExplorer" style={{ width: '100%', height: '100vh' }} />
}

function parseSchema(introspection: IntrospectionQuery) {
  const schema = buildClientSchema(introspection)
  const sdl = printSchema(schema)
  return sdl
}

const fetcher = (url: string) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({ query: getIntrospectionQuery() })
  }).then((res) => res.json())

const GraphQLPlayground = () => {
  const { id: validatorIdParam, account } = useParams()
  const { validatorId } = useContext(GraphqlContext)

  const id = validatorIdParam || validatorId

  const { data, error } = useSWR(endpointUrl, fetcher)

  if (error) return <div>Error fetching schema</div>
  if (!data || !account || !id || typeof account !== 'string' || typeof id !== 'string')
    return <div></div>

  const introspection = data.data as IntrospectionQuery
  const schema = parseSchema(introspection)

  return <Playground account={account} id={id} schema={schema} />
}

export default GraphQLPlayground
