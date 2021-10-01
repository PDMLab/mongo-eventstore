[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Join the chat at https://gitter.im/pdmlab/community](https://badges.gitter.im/pdmlab/community.svg)](https://gitter.im/pdmlab/community)

# mongo-eventstore - an Eventstore for Node.js build on top of MongoDB

This library provides an eventstore based on (but not affiliated with) MongoDB implemented in TypeScript.

It is based on personal expierence with Event Sourcing and also inspired by this [EventSourcing.NodeJS](https://github.com/oskardudycz/EventSourcing.NodeJS) samples.

A sample can be found [here](https://github.com/AlexZeitler/mongo-eventstore-sample).

## Installation

```bash
npm install mongo-eventstore mongodb
```

or

```bash
yarn add mongo-eventstore mongodb
```

## Usage

`mongo-eventstore` currently supports these operations:

```typescript
type EventStore = {
  readStream: (streamId: string) => Promise<Event[]>
  readAllEvents: (options?: { batchSize?: number }) => Promise<Event[]>
  appendToStream: (
    streamId: string,
    eventData: Event | Event[]
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
```

### Creating an Event Store

```typescript
import { MongoClient } from 'mongodb'
import MongoDbEventStore from 'mongo-eventstore'

const client = await MongoClient.connect('mongodb://localhost:27017')
const db = client.db('TestDb')
const eventstore = await MongoDbEventStore(db, 'customer')
```

### Appending events to a stream

```typescript
import { Event } from 'mongo-eventstore'
import { v4 } from 'uuid'

type Created = Event<
  `Created`,
  { firstName: string; lastName: string; level: number }
>

const event: Created = {
  type: 'Created',
  firstName: 'John',
  lastName: 'Doe',
  level: '0'
}
const streamId = v4()
await eventstore.appendToStream(streamId, [event])
```

The event will be persisted into the collection `customer.events` in database `TestDb` and look like this:

```json
{
  "type": "Created",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "level": 0
  },
  "timestamp": 1631174064135,
  "streamId": "TestEvents",
  "version": 1
}
```

### Reading events from a stream

```typescript
const events = await eventstore.readStream('TestEvents')
```

### Building in-memory projections for a particular stream

```typescript
import { MongoClient } from 'mongodb'
import { Projection } from 'mongo-eventstore'

function projectCustomerNames(
  currentState: Partial<CustomerNamesProjection>,
  event: CustomerEvent
): Partial<CustomerNamesProjection> {
  switch (event.type) {
    case 'Created': {
      const projection: CustomerNamesProjection = {
        id: event.streamId,
        type: 'CustomerNamesProjection',
        firstName: event.data.firstName,
        lastName: event.data.lastName
      }
      return projection
    }
    default:
      return currentState
  }
}

const events = (await eventstore.readAllEvents()) as CustomerEvent[]
const projections = eventstore.aggregateStream(events, projectCustomerNames)
```

The projections based on the event above will look like this:

```json
[
  {
    "type": "CustomerNamesProjection",
    "firstName": "John",
    "lastName": "Doe"
  }
]
```

### Building in-memory projections for all streams

```typescript
const eventstore = await MongoDbEventStore(db, StreamName, [
  {
    projectionType: 'CustomerNamesProjection',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: projectCustomerNames as any
  }
])

const projections = await eventstore.aggregateAll()
```

## Want to help?

This project is just getting off the ground and could use some help with cleaning things up and refactoring.

If you want to contribute - we'd love it! Just open an issue to work against so you get full credit for your fork. You can open the issue first so we can discuss and you can work your fork as we go along.

If you see a bug, please be so kind as to show how it's failing, and we'll do our best to get it fixed quickly.

Before sending a PR, please [create an issue](issues/new) to introduce your idea and have a reference for your PR.

We're using [conventional commits](https://www.conventionalcommits.org), so please use it for your commits as well.

Also please add tests and make sure to run `npm run lint-ts` or `yarn lint-ts`.

## License

MIT License

Copyright (c) 2020 - 2021 PDMLab

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
