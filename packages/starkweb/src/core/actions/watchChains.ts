import type { Config } from '../createConfig.js'
import type { GetChainsReturnType } from './getChains.js'

export type WatchChainsParameters = {
  onChange(
    chains: GetChainsReturnType,
    prevChains: GetChainsReturnType,
  ): void
}

export type WatchChainsReturnType = () => void

/**
 * @internal
 * We don't expose this because as far as consumers know, you can't chainge (lol) `config.chains` at runtime.
 * Setting `config.chains` via `config._internal.chains.setState(...)` is an extremely advanced use case that's not worth documenting or supporting in the public API at this time.
 */
export function watchChains<config extends Config>(
  config: config,
  parameters: WatchChainsParameters,
): WatchChainsReturnType {
  const { onChange } = parameters
  return config._internal.chains.subscribe((chains, prevChains) => {
    onChange(chains, prevChains)
  })
}
