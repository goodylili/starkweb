'use client'

import { useMutation } from '@tanstack/react-query'
import {
  type DisconnectData,
  type DisconnectMutate,
  type DisconnectMutateAsync,
  type DisconnectVariables,
  disconnectMutationOptions,
} from '../../core/query/disconnect.js'

import type { ConfigParameter } from '../types/properties.js'
import type {
  UseMutationParameters,
  UseMutationReturnType,
} from '../utils/query.js'
import { useConfig } from './useConfig.js'
import { useConnections } from './useConnections.js'
import type { DisconnectErrorType } from '../../core/actions/disconnect.js'
import type { Connector } from '../../core/createConfig.js'

export type UseDisconnectParameters<
  context = unknown,
> = ConfigParameter & {
    mutation?:
      | UseMutationParameters<
          DisconnectData,
          DisconnectErrorType,
          DisconnectVariables,
          context
        >
      | undefined
  }

export type UseDisconnectReturnType<
  context = unknown,
> = UseMutationReturnType<
  DisconnectData,
  DisconnectErrorType,
  DisconnectVariables,
  context
> & {
    connectors: readonly Connector[]
    disconnect: DisconnectMutate
    disconnectAsync: DisconnectMutateAsync
  }

/** https://starkweb.xyz/react/api/hooks/useDisconnect */
export function useDisconnect<
  context = unknown,
>(
  parameters: UseDisconnectParameters<context> = {},
): UseDisconnectReturnType<context> {
  const { mutation } = parameters

  const config = useConfig(parameters)
  const mutationOptions = disconnectMutationOptions(config)
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  })

  return {
    ...result,
    connectors: useConnections({ config }).map(
      (connection) => connection.connector,
    ),
    disconnect: mutate,
    disconnectAsync: mutateAsync,
  }
}
