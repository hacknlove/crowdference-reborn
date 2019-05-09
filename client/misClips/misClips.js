import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { misClips } from '/common/baseDeDatos'

ventanas.use('/ver/misClips', function (match, v) {
  return v.push({
    _id: 'misClips'
  })
})

Template.misClips.onCreated(function () {
  ventanas.conf('path', `/ver/misClips`)
})

Template.misClips.helpers({
  misClips () {
    return misClips.find({}, {
      sort: {
        ultimoAcceso: -1
      }
    })
  }
})
