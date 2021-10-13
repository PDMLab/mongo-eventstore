import { Event } from './Event'

export type EventStream<T extends Event = Event> = {
  events: T[]
  streamId: string
}
