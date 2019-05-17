import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { clips } from '/common/baseDeDatos'

Template.busqueda.onCreated(function () {
  ventanas.conf('path', `/s/${encodeURIComponent(this.data.busqueda)}`)
  this.autorun(function () {
    Meteor.subscribe('busqueda', ventanas.findOne('busqueda').busqueda)
  })
})

Template.busqueda.helpers({
  clips () {
    return clips.find({
      posts: {
        $gt: 0
      }
    }, {
      sort: {
        actualizacion: -1
      }
    })
  }
})
