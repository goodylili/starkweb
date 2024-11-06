import type { MutationOptions } from '@tanstack/query-core'

import {
  type ConnectErrorType,
  type ConnectParameters,
  type ConnectReturnType,
  connect,
} from '../actions/connect.js'

import type { Mutate, MutateAsync } from './types.js'
import type { Config } from '../createConfig.js'

export function connectMutationOptions(config: Config) {
  return {
    mutationFn(variables) {
      return connect(config,variables)
    },
    mutationKey: ['connect'],
  } as const satisfies MutationOptions<
    ConnectData,
    ConnectErrorType,
    ConnectVariables
  >
}

export type ConnectData = ConnectReturnType

export type ConnectVariables = ConnectParameters

export type ConnectMutate<context = unknown> = Mutate<
  ConnectData,
  ConnectErrorType,
  ConnectVariables,
  context
>

export type ConnectMutateAsync<context = unknown> = MutateAsync<
  ConnectData,
  ConnectErrorType,
  ConnectVariables,
  context
>
