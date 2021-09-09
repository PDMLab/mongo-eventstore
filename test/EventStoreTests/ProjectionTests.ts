import expect from 'expect'
import { Db, MongoClient } from 'mongodb'

import MongoDbEventStore from '../../src/MongoDbEventStore'
import { Event } from '../../src/Event'
import { EventStore } from '../../src/EventStore'
import { StreamName } from './Constants'

type CreatedEvent = Event<
  `CreatedEvent`,
  { firstName: string; lastName: string; level: number }
>

type UpgradedEvent = Event<`UpgradedEvent`, { level: number }>

type CustomerEvent = CreatedEvent | UpgradedEvent

type NamesProjection = {
  id: string
  type: 'NamesProjection'
  firstName: string
  lastName: string
}

export function projectNames(
  currentState: Partial<NamesProjection>,
  event: CustomerEvent
): Partial<NamesProjection> {
  switch (event.type) {
    case 'CreatedEvent': {
      const projection: NamesProjection = {
        id: event.streamId,
        type: 'NamesProjection',
        firstName: event.data.firstName,
        lastName: event.data.lastName
      }
      return projection
    }
    default:
      return currentState
  }
}

export function projectGrades(
  currentState: Partial<GradesProjection>,
  event: CustomerEvent
): Partial<GradesProjection> {
  switch (event.type) {
    case 'CreatedEvent': {
      const projection: GradesProjection = {
        id: event.streamId,
        fullName: `${event.data.firstName} ${event.data.lastName}`,
        type: 'GradesProjection',
        level: event.data.level
      }
      return projection
    }

    case 'UpgradedEvent': {
      return {
        ...currentState,
        level: event.data.level
      }
    }
    default:
      return currentState
  }
}

type GradesProjection = {
  id: string
  type: 'GradesProjection'
  fullName: string
  level: number
}

describe('Projection', (): void => {
  let client: MongoClient
  let db: Db
  const uri = 'mongodb://localhost:27017/'
  const dbName = 'testdb'

  beforeEach(async () => {
    client = await MongoClient.connect(uri)
    db = client.db(dbName)
  })

  afterEach(async () => {
    const collections = await client.db(dbName).collections()
    for (const collection of collections) {
      await client.db(dbName).dropCollection(collection.collectionName)
    }
    await client.close(true)
  })
  describe('when events exist', (): void => {
    let eventstore: EventStore

    beforeEach(async () => {
      eventstore = await MongoDbEventStore(db, StreamName, [
        {
          projectionType: 'NamesProjection',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          project: projectNames as any
        },
        {
          projectionType: 'GradesProjection',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          project: projectGrades as any
        }
      ])

      const event1: CreatedEvent = {
        type: 'CreatedEvent',
        data: {
          firstName: 'John',
          lastName: 'Doe',
          level: 0
        },
        timestamp: Date.now()
      }
      const event2: UpgradedEvent = {
        type: 'UpgradedEvent',
        data: {
          level: 5
        },
        timestamp: Date.now()
      }

      await eventstore.appendToStream('TestEvents', [event1, event2])
    })

    it('should aggregate all', async () => {
      const projections = await eventstore.aggregateAll()

      expect(projections.length).toEqual(2)
    })

    it('should aggregate stream', async () => {
      const events = (await eventstore.readAllEvents()) as CustomerEvent[]
      const projections = eventstore.aggregateStream(events, projectNames)
      const projections2 = eventstore.aggregateStream(events, projectGrades)

      expect(projections.firstName).toEqual('John')
      expect(projections2.level).toEqual(5)
    })
  })
})
