import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { favoritos, clips } from '/common/baseDeDatos'

Template.favoritos.onCreated(function () {
  ventanas.conf('path', `/f`)
})

Template.favoritos.helpers({
  favoritos () {
    return favoritos.find({}, {
      sort: {
        ultimoAcceso: -1
      }
    })
  }
})

Template.vistafavoritos.onCreated(function () {
  console.log(this.data.clipId)
  this.subscribe('clipId', this.data.clipId)
})

Template.vistafavoritos.helpers({
  clip () {
    return clips.findOne(this.clipId)
  }
})
