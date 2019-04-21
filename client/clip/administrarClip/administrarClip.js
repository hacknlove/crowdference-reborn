import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'
import { clips } from '/common/baseDeDatos'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.administrarClip.onCreated(function () {
  Meteor.subscribe('administrarClip', {
    url: this.data.url,
    secreto: this.data.secreto
  })
  ventanas.close('portada')
})
Template.administrarClip.helpers({
  clip () {
    return clips.findOne({
      url: this.url
    })
  }
})
Template.administrarClip.onDestroyed(function () {
  ventanas.close('menu')
  ventanas.insert({
    _id: 'portada'
  })
})
ventanas.use('/admin/:url/:secreto', function (match, v) {
  return v.push({
    url: match.url,
    _id: 'administrarClip',
    secreto: match.secreto
  })
})
