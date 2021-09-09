import expect from 'expect'
import { Db, MongoClient } from 'mongodb'

import MongoDbEventStore from '../../src/MongoDbEventStore'
import { Event } from '../../src/Event'
import { EventStore } from '../../src/EventStore'
import { StreamName } from './Constants'

type CreatedEvent = Event<`CreatedEvent`>
type UpdatedEvent = Event<`UpdatedEvent`>

describe('MongoDbEventStore', () => {
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

  describe('when mongodb eventstore contains 2 events for the same stream', (): void => {
    let eventstore: EventStore

    beforeEach(async () => {
      eventstore = await MongoDbEventStore(db, StreamName)

      const event1: CreatedEvent = {
        type: 'CreatedEvent',
        data: {},
        timestamp: Date.now(),
        metadata: {
          causation: '123',
          correlation: '123'
        }
      }
      const event2: UpdatedEvent = {
        type: 'UpdatedEvent',
        data: {
          some: 'data'
        },
        timestamp: Date.now(),
        metadata: {
          causation: '123',
          correlation: '123'
        }
      }

      await eventstore.appendToStream('TestEvents', [event1, event2])
    })

    describe('when getting events by streamId', (): void => {
      it('should return the events', async () => {
        const events = await eventstore.readStream('TestEvents')
        expect(events.length).toEqual(2)
      })

      it('should order events by version', async () => {
        const events = await eventstore.readStream('TestEvents')
        expect(events[0].version).toEqual(1)
        expect(events[1].version).toEqual(2)
      })
    })

    describe('when reading all event by streamId', (): void => {
      it('should return the events', async () => {
        const events = await eventstore.readStream('TestEvents')
        expect(events.length).toEqual(2)
      })

      it('should order events by version', async () => {
        const events = await eventstore.readStream('TestEvents')
        expect(events[0].version).toEqual(1)
        expect(events[1].version).toEqual(2)
      })
    })
  })
})
