import Fingerprint2 from 'fingerprintjs2'
import { Meteor } from 'meteor/meteor'
import crypto from 'crypto'
export var fingerprint

Meteor.startup(function () {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(function () {
      Fingerprint2.get(guardar)
    })
  } else {
    setTimeout(function () {
      Fingerprint2.get(guardar)
    }, 500)
  }

  const guardar = function (components) {
    components = JSON.stringify(components)
    const sha512 = crypto.createHash('sha256')
    sha512.update(components)
    fingerprint = sha512.digest('base64').replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '.')
  }
})
