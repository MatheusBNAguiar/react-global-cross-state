import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { GlobalStore } from './store'
export { createGlobalStore } from './store'

export function useGlobalStoreValue<State>(store: GlobalStore<State>): State {
  return useSyncExternalStore<State>(store.subscribe, () => store.getState())
}

export function useSetGlobalStore<State>(
  store: GlobalStore<State>,
): GlobalStore<State>['setState'] {
  return store.setState
}

export function useGlobalStore<State>(
  store: GlobalStore<State>,
): [State, GlobalStore<State>['setState']] {
  const state = useGlobalStoreValue(store)
  const setState = useSetGlobalStore(store)
  return [state, setState]
}
