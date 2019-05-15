import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { misClips, clips } from '/common/baseDeDatos'

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

Template.vistaMisClips.onCreated(function () {
  this.subscribe('clipId', {
    clipId: this.data._id,
    secreto: this.data.secreto
  })
})

Template.vistaMisClips.helpers({
  clip () {
    return clips.findOne(this._id)
  }
})
