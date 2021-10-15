# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.7](https://github.com/PDMLab/mongo-eventstore/compare/v0.0.6...v0.0.7) (2021-10-15)


### Bug Fixes

* prevent piling up projections on every `aggregateAll` call ([#9](https://github.com/PDMLab/mongo-eventstore/issues/9)) ([c68b36d](https://github.com/PDMLab/mongo-eventstore/commit/c68b36dbf38a03bf3f7041805e026c974ba66267))

### [0.0.6](https://github.com/PDMLab/mongo-eventstore/compare/v0.0.5...v0.0.6) (2021-10-14)


### Bug Fixes

* projections must not be shared between store instances ([#8](https://github.com/PDMLab/mongo-eventstore/issues/8)) ([9b6cfa4](https://github.com/PDMLab/mongo-eventstore/commit/9b6cfa410b7a531300fe1fc43b676f3f1d85469d))

### [0.0.5](https://github.com/PDMLab/mongo-eventstore/compare/v0.0.4...v0.0.5) (2021-10-13)


### Features

* return event stream after append ([#7](https://github.com/PDMLab/mongo-eventstore/issues/7)) ([b04f089](https://github.com/PDMLab/mongo-eventstore/commit/b04f089316d75ae968dbb769e40a2fea44359773))

### [0.0.4](https://github.com/PDMLab/mongo-eventstore/compare/v0.0.3...v0.0.4) (2021-10-11)

### [0.0.3](https://github.com/PDMLab/mongo-eventstore/compare/v0.0.2...v0.0.3) (2021-10-09)


### Features

* optimistic concurrency check ([#5](https://github.com/PDMLab/mongo-eventstore/issues/5)) ([456569b](https://github.com/PDMLab/mongo-eventstore/commit/456569b91aba7701779b6f807862c8d84fe84507))

### [0.0.2](https://github.com/PDMLab/mongo-eventstore/compare/v0.0.1...v0.0.2) (2021-09-30)


### Features

* export type `EventStore` ([#3](https://github.com/PDMLab/mongo-eventstore/issues/3)) ([c75f545](https://github.com/PDMLab/mongo-eventstore/commit/c75f54581bc9c9793bc26f7423820e25017fb85f))

### 0.0.1 (2021-09-09)


### Features

* append/read events, build projections ([fd09895](https://github.com/PDMLab/mongo-eventstore/commit/fd09895517af1fe0fb5510375bbfbf7995dc8f2f))
