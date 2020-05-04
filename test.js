const liquid = require('./index')
const Vinyl = require('vinyl')
const assert = require('assert')
const { describe, it } = require('mocha')

const opts = {
  data: { name: 'tuna' },
  filters: {
    test: (v) => v + ' test'
  }
}

describe('empty', () => {
  it('interpolate {{...}}', cb => {
    const stream = liquid()

    stream.on('data', file => {
      assert.equal('hi ', file.contents.toString())
      cb()
    })

    stream.write(new Vinyl({
      path: 'file.liquid',
      contents: Buffer.from('hi {{name}}')
    }))
  })

  it('default tags {%...%}', cb => {
    const stream = liquid(opts)

    stream.on('data', function (file) {
      assert.equal('OK', file.contents.toString())
      cb()
    })

    stream.write(new Vinyl({
      path: 'file.liquid',
      contents: Buffer.from('{% if name %}OK{% endif %}')
    }))
  })

  it('default filter {{... | ...}}', cb => {
    const stream = liquid(opts)
    stream.on('data', file => {
      assert.equal('nana', file.contents.toString())
      cb()
    })

    stream.write(new Vinyl({
      path: 'file.liquid',
      contents: Buffer.from('{{name | replace: "tu", "na"}}')
    }))
  })
})

describe('with options', () => {
  it('interpolate {{...}}', cb => {
    const stream = liquid(opts)

    stream.on('data', file => {
      assert.equal('hi tuna', file.contents.toString())
      cb()
    })

    stream.write(new Vinyl({
      path: 'file.liquid',
      contents: Buffer.from('hi {{name}}')
    }))
  })

  it('custom filters {{... | ...}}', cb => {
    const stream = liquid(opts)

    stream.on('data', file => {
      assert.equal('tuna test', file.contents.toString())
      cb()
    })

    stream.write(new Vinyl({
      path: 'file.liquid',
      contents: Buffer.from('{{name | test}}')
    }))
  })
})
