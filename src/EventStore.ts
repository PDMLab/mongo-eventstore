import { Projection } from './MongoDbEventStore'
import { Event } from './Event'
import { EventStream } from './EventStream'

export type EventStore<T extends Event> = {
  /**
   * Reads the events of a stream by its `streamId`
   * @param {string} streamId
   * @returns Promise<Event[]>
   */
  readStream: (streamId: string) => Promise<Event[]>

  /**
   * reads all events of all streams
   * @param {options} [options]
   * @param {number} [options.batchSize]
   */
  readAllEvents: (options?: { batchSize?: number }) => Promise<Event[]>
  appendToStream: (
    streamId: string,
    eventData: Event | Event[],
    options?: { expectedVersion?: number }
  ) => Promise<EventStream<T>>
  /**
   * builds all projections
   * @returns Promise<Projection[]>
   */
  aggregateAll: () => Promise<Projection[]>
  /**
   * builds the projections for an array of events and the projector function
   * @param {Event[]} events - the events to project
   * @param {Function} project - the projection function
   */
  aggregateStream<Projection, SomeEvent extends Event>(
    events: SomeEvent[],
    project: (
      currentState: Partial<Projection>,
      event: SomeEvent
    ) => Partial<Projection>
  ): Projection
}
