import { Event, EventData, Metadata } from './Event'
import { EventStore } from './EventStore'
import MongoDbEventStore, { Projection } from './MongoDbEventStore'

export { Event, EventData, EventStore, Metadata, Projection }
export default MongoDbEventStore
