const Nanobus = require('nanobus')

function makeID () {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

class Device {
  constructor (opts = {}) {
    const { pub = makeID(), identityGroup = {}, externalIdentityGroups = {}, dht = {} } = opts
    this.pub = pub
    this.priv = opts.priv || `${this.pub}-priv`
    this.identityGroup = identityGroup
    this.externalIdentityGroups = externalIdentityGroups
    this.ejected = false
    this.dht = dht
  }

  get identitySet () {
    const inSet = {}
    const outSet = {}
    if (this.ejected) {
      outSet[this.pub] = true
    } else {
      inSet[this.pub] = true
    }

    Object.entries(this.identityGroup).forEach(id => {
      if (id[1] === false) {
        outSet[id[0]] = true
        return
      }
      inSet[id[0]] = true
      const extIG = this.externalIdentityGroups[id[0]]
      if (extIG) {
        if (extIG[this.pub] === undefined) {
          outSet[id[0]] = true
        }
        Object.entries(extIG).forEach(eid => {
          if (eid[1] === false) {
            outSet[eid[0]] = true
          }
        })
      }
    })
    Object.keys(outSet).forEach(pub => {
      delete inSet[pub]
    })
    return inSet
  }

  add (pubKey) {
    if (pubKey === this.pub) return
    this.identityGroup[pubKey] = true
    this.sync(pubKey)
  }

  remove (pubKey) {
    this.identityGroup[pubKey] = false
    delete this.externalIdentityGroups[pubKey]
  }

  sync (publicKey) {
    const device = this.dht[publicKey]
    if (device && this.identityGroup[publicKey]) {
      this.externalIdentityGroups[publicKey] = Object.assign({}, device.identityGroup)
    }
  }

  syncAll () {
    Object.entries(this.identityGroup).forEach(id => {
      this.sync(id[0])
    })
  }

  reconcile (publicKey) {
    if (!this.identityGroup[publicKey]) return // not in the group!
    const deviceIG = this.externalIdentityGroups[publicKey]
    if (!deviceIG) return // didn't sync anything
    Object.entries(deviceIG).forEach(id => {
      if (id[0] === this.pub) {
        if (this.identityGroup[publicKey] === true && id[1] === false) {
          this.ejected = true
        }
        return // Its me, skip
      }
      const currentPeerStatus = this.identityGroup[id[0]]
      if (currentPeerStatus === false) return // already removed
      if (currentPeerStatus === true) { // Added at some point
        if (id[1] === false) { // peer was removed
          this.remove(id[0])
        }
        return
      }
      this.add(id[0])
      this.sync(id[0])
      this.reconcile(id[0])
    })
  }

  reconcileAll () {
    this.syncAll()
    Object.entries(this.identityGroup).filter(id => id[1]).forEach(id => {
      this.reconcile(id[0])
    })
    this.gc()
  }

  gc () {
    const ejectedIDs = Object.entries(this.identityGroup).filter(id => id[1] === false)
    const notSafeToGC = {}
    const safeToGC = {}
    ejectedIDs.forEach(id => {
      safeToGC[id[0]] = true
    })
    Object.entries(this.identityGroup).filter(id => id[1]).forEach(id => {
      const deviceIG = this.externalIdentityGroups[id[0]]
      if (!deviceIG) return
      ejectedIDs.forEach(id => {
        if (deviceIG[id[0]] === true) {
          notSafeToGC[id[0]] = true
        } else {
          safeToGC[id[0]] = true
        }
      })
    })

    Object.keys(notSafeToGC).forEach(pub => {
      delete safeToGC[pub]
    })

    Object.keys(safeToGC).forEach(pub => {
      delete this.identityGroup[pub]
    })
  }
}

module.exports = Device
