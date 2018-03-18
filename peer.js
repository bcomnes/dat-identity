var nanostate = require('nanostate')

function newPeer (state) {
  if (!state) state = 'denied'
  return nanostate(state, {
    denied: { offer: 'offered' },
    offered: { accept: 'accepted', deny: 'denied' },
    accepted: { ban: 'banned' },
    banned: { unban: 'unbanned' },
    unbanned: { offer: 'offered' }
  })
}

const deviceIdentity = nanostate('starting', {
  starting: { load: 'loading' },
  loading: { initialize: 'initializing', loadExisting: 'loadExisting' }
})
