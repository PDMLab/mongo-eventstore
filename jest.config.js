module.exports = {
  testRegex: 'test/.+[Tt]ests?\\.tsx?$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  coverageDirectory: './coverage/',
  collectCoverage: true
}
