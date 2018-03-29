const test = require('tape')
const DatIdentity = require('../device')
const tmp = require('temporary-directory')
const path = require('path')

test('setup', t => {
  tmp((err, dir, cleanup) => {
    t.error(err)
    console.log(`Created ${dir}`)
    const devA = new DatIdentity(path.join(dir, 'devA'))

    cleanup(err => {
      t.error(err)
      t.end()
    })
  })
})
