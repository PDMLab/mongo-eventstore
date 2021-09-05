import expect from 'expect'
import { Db, Document, MongoClient } from 'mongodb'

import MongoDbEventStore from '../../src/MongoDbEventStore'
import { StreamCollection, StreamName } from './Constants'

describe('MongoDbEventStore', () => {
  let client: MongoClient
  let db: Db
  const uri = `mongodb://localhost:27017`
  const dbName = 'testdb'

  beforeEach(async () => {
    client = await MongoClient.connect(uri)
    db = client.db(dbName)
  })

  afterEach(async () => {
    const collections = await db.collections()
    for (const collection of collections) {
      await client.db(dbName).dropCollection(collection.collectionName)
    }

    await client.close(true)
  })

  it('when creating mongo event store should create index for aggregate type and aggregate id', async (): Promise<void> => {
    await MongoDbEventStore(db, StreamName)

    const client = await MongoClient.connect(uri)
    const indexes = await client
      .db(dbName)
      .collection(StreamCollection)
      .indexes()

    const exists = await client
      .db(dbName)
      .collection(StreamCollection)
      .indexExists('EventsByStreamIdAndVersion')

    const index = indexes.find((i: Document) => {
      return i.name === 'EventsByStreamIdAndVersion'
    })

    await client.close()
    expect(exists).toBe(true)
    expect(index.key.version).toEqual(1)
    expect(index.key.streamId).toEqual(1)
  })
})
