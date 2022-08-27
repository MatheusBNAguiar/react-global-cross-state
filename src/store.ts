import EventEmitter from 'events'
import { BroadcastChannel } from './broadcast-channel'

type SetStateCallback<State> = (prevState: State) => State
type SetStateInput<State> = State | SetStateCallback<State>

export type GlobalStore<State> = {
  getState: () => State
  setState: (newState: SetStateInput<State>) => State
  subscribe: (sub: (state: State) => void) => () => void
}

export function createGlobalStore<State>(
  initialState: State,
  options?: {
    asyncExecution?: boolean
    crossWindowLabel?: string
  },
): GlobalStore<State> {
  type InternalEvents = { update: (state: State) => void }

  const emitter = new EventEmitter()
  const globalEmitter = options?.crossWindowLabel
    ? BroadcastChannel<InternalEvents>(options.crossWindowLabel)
    : null

  let localState = initialState

  function getState(): State {
    return localState
  }

  function setState(newState: SetStateInput<State>): State {
    if (newState instanceof Function) {
      localState = newState(localState)
    } else {
      localState = newState
    }
    emitter.emit('update')
    if (globalEmitter) {
      globalEmitter.sendMessage(`update`, localState)
    }
    return localState
  }

  function subscribeLocal(callback: (state: State) => void) {
    const innerSub = () => {
      if (options?.asyncExecution) {
        setImmediate(() => {
          callback(localState)
        })
      } else {
        callback(localState)
      }
    }
    emitter.on('update', innerSub)
    return () => {
      emitter.removeListener('update', innerSub)
    }
  }

  function subscribeRemote() {
    if (globalEmitter) {
      return globalEmitter.listen((key: string, newState: State) => {
        if (key === 'update') {
          localState = newState
          emitter.emit('update')
        }
      })
    }
    return () => {}
  }

  function subscribe(callback: (state: State) => void) {
    const disposeRemote = subscribeRemote()
    const disposeLocal = subscribeLocal(callback)
    return () => {
      disposeLocal()
      disposeRemote()
    }
  }

  return {
    getState,
    setState,
    subscribe,
  }
}
