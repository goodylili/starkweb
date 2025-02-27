import type { Client } from '../../clients/createClient.js'
import type { StarknetChainId } from '../../constants/starknet.js'
import {
  getChecksumAddress,
  validateChecksumAddress,
} from '../../strk-utils/address.js'
import { compile } from '../../strk-utils/calldata/compile.js'
import { getSelectorFromName } from '../../strk-utils/hash/selector.js'
import { encodeShortString } from '../../strk-utils/shortString.js'
import type { StarknetIdContracts } from '../../types/starknetId.js'
import type { Prettify } from '../../types/utils.js'
import {
  getIdentityContract,
  isStarkDomain,
} from '../../utils/starknetId/utils.js'
import { getStarknetId } from './getStarknetId.js'
import { getStarknetIdName } from './getStarknetIdName.js'

export type GetStarknetIdExtendedUserDataParameters = Prettify<{
  /** Starknet ID, domain, or address to get the extended user data for. */
  idDomainOrAddr: string
  /** Field to retrieve from extended user data. */
  field: string
  /** Length of the extended data to retrieve. */
  length: number
}>

export type GetStarknetIdExtendedUserDataReturnType = bigint[]

export type GetStarknetIdExtendedUserDataErrorType = Error

export async function getStarknetIdExtendedUserData(
  client: Client,
  { idDomainOrAddr, field, length }: GetStarknetIdExtendedUserDataParameters,
): Promise<GetStarknetIdExtendedUserDataReturnType> {
  const chainId = client.chain?.id as unknown as StarknetChainId
  if (!chainId) {
    throw new Error('Chain ID is required')
  }

  const StarknetIdContract: StarknetIdContracts = {
    identity: getIdentityContract(chainId),
  }

  if (!StarknetIdContract.identity) {
    throw new Error(
      `Starknet ID identity contract address not found for chain ID: ${chainId}`,
    )
  }

  const id = await checkArguments(client, idDomainOrAddr)

  try {
    const result = await client.request({
      method: 'starknet_call',
      params: {
        request: {
          contract_address: StarknetIdContract.identity,
          entry_point_selector: getSelectorFromName('get_extended_user_data'),
          calldata: compile([
            id.toString(),
            encodeShortString(field),
            length.toString(),
            '0',
          ]),
        },
        block_id: 'latest',
      },
    })

    if (Array.isArray(result) && result.length > 0) {
      result.shift() // Remove the first element
      return result.map((element: string) => BigInt(element))
    }
    throw new Error('Invalid response from contract call')
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      throw error
    }
    throw new Error(
      `Could not get user extended data from starknet id: ${error}`,
    )
  }
}

async function checkArguments(
  client: Client,
  idDomainOrAddr: string,
): Promise<string> {
  if (typeof idDomainOrAddr !== 'string') {
    throw new Error('Invalid idDomainOrAddr argument')
  }

  if (/^\d+$/.test(idDomainOrAddr)) {
    // is a positive number
    return idDomainOrAddr
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else if (isStarkDomain(idDomainOrAddr)) {
    // is a starkDomain
    return await getStarknetId(client, { domain: idDomainOrAddr })
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else if (/^[-+]?0x[0-9a-f]+$/i.test(idDomainOrAddr)) {
    // is a hex address
    const checkSumAddr = getChecksumAddress(idDomainOrAddr)
    if (validateChecksumAddress(checkSumAddr)) {
      const starkName = await getStarknetIdName(client, {
        address: idDomainOrAddr,
      })
      if (starkName === '') {
        throw new Error('User not found')
      }
      return await getStarknetId(client, { domain: starkName })
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      throw new Error('Invalid Starknet address')
    }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    throw new Error('Invalid idDomainOrAddr argument')
  }
}
