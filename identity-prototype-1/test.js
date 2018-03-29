const test = require('tape')
const Device = require('./device.js')

test('creating two devices and adding them', t => {
  const dht = {}
  const a = new Device({ dht, pub: 'a' })
  const b = new Device({ dht, pub: 'b' })

  dht[a.pub] = a
  dht[b.pub] = b

  t.equal(a, dht[a.pub])
  t.equal(b, dht[b.pub])

  a.add(b.pub)
  t.ok(a.identityGroup[b.pub])

  const c = new Device({ dht, pub: 'c' })
  dht[c.pub] = c
  b.add(c.pub)
  c.add(b.pub)

  a.reconcileAll()
  b.reconcileAll()
  c.reconcileAll()

  t.deepEqual(a.identitySet, b.identitySet)
  t.deepEqual(a.identitySet, c.identitySet)
  t.deepEqual(b.identitySet, c.identitySet)

  console.log(a.identitySet)
  console.log(b.identitySet)
  console.log(c.identitySet)
  console.log('c.remove(a.pub)')
  c.remove(a.pub)

  c.reconcileAll()
  a.reconcileAll()
  b.reconcileAll()

  console.log(a.identitySet)
  console.log(b.identitySet)
  console.log(c.identitySet)
  console.log('c.remove(b.pub)')
  c.remove(b.pub)
  console.log('a.add(b.pub)')
  a.add(b.pub)
  console.log('b.add(a.pub)')
  b.add(a.pub)

  c.reconcileAll()
  a.reconcileAll()
  b.reconcileAll()

  console.log(a.identitySet)
  console.log(b.identitySet)
  console.log(c.identitySet)

  console.log('a.add(b.pub)')
  a.add(b.pub)
  console.log('a.remove(c.pub)')
  a.remove(c.pub)
  console.log('b.remove(c.pub)')
  b.remove(c.pub)
  console.log('b.add(a.pub)')
  b.add(a.pub)

  console.log(a.identitySet)
  console.log(b.identitySet)
  console.log(c.identitySet)

  console.log('reconcileAll()')
  a.reconcileAll()
  b.reconcileAll()
  c.reconcileAll()

  console.log(a.identitySet)
  console.log(b.identitySet)
  console.log(c.identitySet)

  t.end()
})
