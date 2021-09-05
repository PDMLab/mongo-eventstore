import expect from 'expect'
import { Db, MongoClient } from 'mongodb'

import MongoDbEventStore from '../../src/MongoDbEventStore'
import { Event } from '../../src/Event'
import { StreamCollection, StreamName } from './Constants'

type TestSucceededEvent = Event<`TestSucceeded`, { some: string }>

describe('MongoDbEventStore', () => {
  let client: MongoClient
  let db: Db
  const uri = 'mongodb://localhost:27017/'
  const dbName = 'testdb'

  beforeEach(async () => {
    client = await MongoClient.connect(uri)
    db = client.db(dbName)
    console.log('connected')
  })

  afterEach(async () => {
    const collections = await client.db(dbName).collections()
    for (const collection of collections) {
      await client.db(dbName).dropCollection(collection.collectionName)
    }
    await client.close(true)
  })

  describe('when EventStore is empty', () => {
    describe('when saving 1 event', () => {
      it('should contain event 1', async () => {
        const eventstore = await MongoDbEventStore(db, StreamName)
        const testClient = await MongoClient.connect(uri)

        const event: TestSucceededEvent = {
          type: 'TestSucceeded',
          version: 1,

          data: {
            some: 'data'
          },
          timestamp: Date.now(),
          metadata: {
            causation: 'HTTPCausation',
            correlation: '123'
          }
        }

        await eventstore.appendToStream('testEvents', [event])
        const events = await testClient
          .db(dbName)
          .collection(StreamCollection)
          .find()
          .toArray()
        await testClient.close(true)
        expect(events.length).toEqual(1)
      })
    })

    describe('when saving 2 events for two aggregates', (): void => {
      it('should contain events', async () => {
        const eventstore = await MongoDbEventStore(db, StreamName)
        const testClient = await MongoClient.connect(uri)

        const event1: TestSucceededEvent = {
          type: 'TestSucceeded',
          version: 1,

          data: {
            some: 'data'
          },
          timestamp: Date.now(),
          metadata: {
            causation: 'HTTPCausation',
            correlation: '123'
          }
        }

        const event2: TestSucceededEvent = {
          type: 'TestSucceeded',
          version: 1,

          data: {
            some: 'data'
          },
          timestamp: Date.now(),
          metadata: {
            causation: 'HTTPCausation',
            correlation: '123'
          }
        }

        await eventstore.appendToStream('testEvents', [event1])
        await eventstore.appendToStream('testEvents', [event2])

        const events = await testClient
          .db(dbName)
          .collection(StreamCollection)
          .find()
          .toArray()
        await testClient.close(true)
        expect(events.length).toEqual(2)
      })
    })
  })
})
