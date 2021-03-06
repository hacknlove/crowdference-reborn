import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { clips } from '/common/baseDeDatos'

Template.recents.onCreated(function () {
  ventanas.conf('path', `/r`)
  this.autorun(function () {
    Meteor.subscribe('recents')
  })
})

Template.recents.helpers({
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
