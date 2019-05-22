import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { favoritos, links } from '/common/baseDeDatos'

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
  this.subscribe('linkId', this.data.linkId)
})

Template.vistafavoritos.helpers({
  link () {
    return links.findOne(this.linkId)
  }
})
