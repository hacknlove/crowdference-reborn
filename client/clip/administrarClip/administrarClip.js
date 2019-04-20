import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'
import { clips } from '/common/baseDeDatos'

Template.administrarClip.onCreated(function () {
  Meteor.subscribe('administrarClip', {
    clipId: this.data.clipId,
    secreto: this.data.secreto
  })
})
Template.administrarClip.onRendered(function () {
  Template.hamburguesa.openWindow('administrarClipMenu')
})
Template.administrarClip.helpers({
  clip () {
    console.log(clips.findOne({
      _id: this.clipId
    }))
    return clips.findOne({
      _id: this.clipId
    })
  }
})
