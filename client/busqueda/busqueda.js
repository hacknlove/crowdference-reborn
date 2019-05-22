import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { links } from '/common/baseDeDatos'

Template.busqueda.onCreated(function () {
  ventanas.conf('path', `/s/${encodeURIComponent(this.data.busqueda)}`)
  this.autorun(function () {
    const data = Template.currentData()
    Meteor.subscribe('busqueda', data.busqueda)
  })
})

Template.busqueda.helpers({
  links () {
    return links.find({}, {
      sort: {
        votos: -1
      }
    })
  }
})
