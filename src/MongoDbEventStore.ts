import { Db } from 'mongodb'

import { Event } from './Event'
import { EventStore } from './EventStore'
import { EventStream } from './EventStream'
import EventStreamUnexpectedMaxEventIdError from './EventStreamUnexpectedMaxEventIdError'

function groupBy<T>(xs: T[], key: string): Record<string, T[]> {
  return xs.reduce(function (rv, x) {
    ;(rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
}

type Projector = {
  projectionType: string
  project<Projection, EventsOfStream extends Event>(
    currentState: Partial<Projection>,
    event: EventsOfStream
  ): Partial<Projection>
}

/**
 * @param {Db} db - MongoDB client 4 database
 * @param {string} streamName - the name of the collection - will be suffixed by "`.events`"
 * @param {Projector[]} [projectors] - projections to be built
 * */
const MongoDbEventStore = async <T extends Event>(
  db: Db,
  streamName: string,
  projectors: Projector[] = []
): Promise<EventStore<T>> => {
  const EventsCollection = `${streamName}.events`
  console.log('initializing event store')
  await db
    .collection(EventsCollection)
    .createIndex(
      { streamId: 1, version: 1 },
      { name: 'EventsByStreamIdAndVersion', unique: true }
    )

  const eventStore = {
    readStream: async (streamId: string): Promise<Event[]> => {
      return await db
        .collection<Event>(EventsCollection)
        .find({ streamId }, { sort: { version: 1 } })
        .toArray()
    },

    appendToStream: async (
      streamId: string,
      eventData: Event | Event[],
      options?: { expectedVersion?: number }
    ): Promise<EventStream<T>> => {
      const events = eventData as Event[]
      const taggedEvents = events.map((e) => {
        e.streamId = streamId
        return e
      })

      let version: number
      const existingEvents = (await db
        .collection<Event>(EventsCollection)
        .find({ streamId })
        .sort({ version: -1 })
        .limit(1)
        .toArray()) as T[]
      if (options && options.expectedVersion) {
        version = options.expectedVersion
      } else {
        version = existingEvents.length === 0 ? 0 : existingEvents[0].version
      }
      const currentVersion = version
      const versionedEvents = taggedEvents.map((e) => {
        version = version + 1
        e.version = version
        return e
      })
      try {
        await db.collection<Event>(EventsCollection).insertMany(versionedEvents)
      } catch (error) {
        if ((error as Error).message.startsWith('E11000')) {
          throw new EventStreamUnexpectedMaxEventIdError(
            streamId,
            options.expectedVersion,
            existingEvents[0].version
          )
        } else {
          throw error
        }
      }

      const newEvents = (await db
        .collection<Event>(EventsCollection)
        .find({ streamId, version: { $gt: currentVersion } })
        .sort({ version: -1 })
        .toArray()) as T[]
      return { events: [...existingEvents, ...newEvents], streamId }
    },
    readAllEvents: async (options?: {
      batchSize?: number
    }): Promise<Event[]> => {
      const events: Event[] = []
      const { batchSize } = options ? options : { batchSize: 1000 }
      await db
        .collection<Event>(EventsCollection)
        .find()
        .sort({ id: 1, version: 1 })
        .allowDiskUse()
        .batchSize(batchSize)
        .forEach((d) => {
          events.push(d)
        })
      return events
    },
    aggregate: async <D extends Projection>(): Promise<D[]> => {
      return []
    },
    aggregateAll: async (): Promise<Projection[]> => {
      let projections: Projection[] = []
      const allEvents = await eventStore.readAllEvents()
      const streams = groupBy<Event>(allEvents, 'streamId')
      const streamIds = Object.keys(streams)
      const projectionTypes = projectors.map((p) => p.projectionType)
      projectionTypes.forEach((projectionType) => {
        const projector = projectors.find(
          (projector) => projector.projectionType === projectionType
        )
        const aggregates = streamIds.map((id) => {
          const aggregate = eventStore.aggregateStream(
            streams[id],
            projector.project
          )
          return aggregate as Projection
        })
        projections = projections.concat(aggregates)
      })

      return projections
    },
    aggregateStream<Projection, SomeEvent extends Event>(
      events: SomeEvent[],
      project: (
        currentState: Partial<Projection>,
        event: SomeEvent
      ) => Partial<Projection>
    ): Projection {
      const state = events.reduce<Partial<Projection>>(project, {})

      return state as Projection
    }
  }

  return eventStore
}

export type Projection = { type: string; id: string } & Record<
  string | number,
  unknown
>

export default MongoDbEventStore
