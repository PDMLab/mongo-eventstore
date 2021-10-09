export default class EventStreamUnexpectedMaxEventIdError extends Error {
  constructor(
    streamId: string,
    expectedVersion: number,
    currentVersion: number
  ) {
    super()
    this.message = `Unexpected starting version number for event stream ${streamId}. Expected version ${expectedVersion} but was ${currentVersion}`
  }
}
