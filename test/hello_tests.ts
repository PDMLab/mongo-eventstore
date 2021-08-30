import 'should'
import { hello } from '../src/index'
require('should')

describe('hello', () => {
  it('should say name', (done) => {
    const sut = hello('alex')
    sut.should.equal('hello, alex')
    done()
  })
})
