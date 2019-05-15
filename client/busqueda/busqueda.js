import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { clips } from '/common/baseDeDatos'

ventanas.use('/busqueda/:busqueda', function (match, v) {
  return v.push({
    _id: 'busqueda',
    busqueda: decodeURIComponent(match.busqueda)
  })
})

Template.busqueda.onCreated(function () {
  ventanas.conf('path', `/busqueda/${encodeURIComponent(this.data.busqueda)}`)
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
        apoyos: -1,
        creacion: -1
      }
    })
  }
})
