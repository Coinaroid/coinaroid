import { Address } from 'viem'
import { createCoinCall } from '@zoralabs/coins-sdk'
import { WriteContractMutate } from 'wagmi/query'
import { Config } from 'wagmi'

export const createCoin = async ({
  address,
  name,
  symbol,
  uri,
  writeContract,
}: {
  address: string
  name: string
  symbol: string
  uri: string
  writeContract: WriteContractMutate<Config, unknown>
}) => {
  // Define coin parameters
  const coinParams = {
    name,
    symbol,
    owners: [address as Address],
    uri,
    payoutRecipient: address as Address,
    platformReferrer: '0xecEa7Fe881cAa461Be04a64caEbA06821F23eE19' as Address,
  }

  // Create configuration for wagmi
  const contractCallParams = await createCoinCall(coinParams)

  writeContract?.({
    abi: contractCallParams.abi,
    functionName: contractCallParams.functionName,
    args: contractCallParams.args,
    address: contractCallParams.address,
    chain: contractCallParams.chain,
    account: contractCallParams.account,
  })
}
