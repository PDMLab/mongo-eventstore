import { Projection } from './MongoDbEventStore'
import { Event } from './Event'

export type EventStore = {
  readStream: (streamId: string) => Promise<Event[]>
  readAllEvents: (options?: { batchSize?: number }) => Promise<Event[]>
  appendToStream: (
    streamId: string,
    eventData: Event | Event[],
    options?: { expectedVersion?: number }
  ) => Promise<void>
  aggregateAll: () => Promise<Projection[]>
  aggregateStream<Projection, SomeEvent extends Event>(
    events: SomeEvent[],
    project: (
      currentState: Partial<Projection>,
      event: SomeEvent
    ) => Partial<Projection>
  ): Projection
}
