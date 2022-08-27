import { nanoid } from 'nanoid'

interface EventMap {
  [key: string]: (...args: any[]) => void
}

interface ChannelInput<Events extends EventMap, EventKey extends Extract<keyof Events, string>> {
  key: EventKey
  source: string
  eventData: Parameters<Events[EventKey]>
}

type BroadcastChannelListener<
  Events extends EventMap,
  EventKey extends Extract<keyof Events, string>,
> = (key: EventKey, ...args: Parameters<Events[EventKey]>) => void

/**
 * Abstract BroadcastChannel to have typings coverage
 */
export function BroadcastChannel<Events extends EventMap>(channelName: string) {
  type EventKeys = Extract<keyof Events, string>

  const sourceId = nanoid()
  const channel = new window.BroadcastChannel(channelName)

  function listen(listener: BroadcastChannelListener<Events, EventKeys>) {
    const channelListener = (messageEvent: MessageEvent<ChannelInput<Events, EventKeys>>) => {
      const { data } = messageEvent
      if (data.source === sourceId) {
        return
      }

      const { key, eventData } = data
      listener(key, ...eventData)
    }

    channel.addEventListener('message', channelListener)
    return () => {
      channel.removeEventListener('message', channelListener)
    }
  }

  function sendMessage<E extends EventKeys>(event: E, ...args: Parameters<Events[E]>) {
    const messagePayload: ChannelInput<Events, E> = {
      key: event,
      eventData: args,
      source: sourceId,
    }
    channel?.postMessage(messagePayload)
  }

  function destroy() {
    channel?.close()
  }

  return {
    listen,
    sendMessage,
    destroy,
  }
}
