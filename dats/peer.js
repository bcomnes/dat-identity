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

var peer = newPeer('accepted')
