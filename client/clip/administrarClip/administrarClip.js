import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.administrarClip.onCreated(function () {
  Meteor.subscribe('clip', {
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
  },
  posts () {
    return posts.find()
  },
  postTemplate (post) {
    console.log(post)
    if (post.rrss) {
      return 'social'
    }
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

Template.administrarClipMenu.helpers({
  url () {
    return (ventanas.findOne('administrarClip') || {}).url
  },
  secreto () {
    return (ventanas.findOne('administrarClip') || {}).secreto
  }
})

Template.adminPost.events({
  'click .cabecero .fa-bars' (event, template) {
    template.$('.miniFondo').addClass('visible')
  },
  'click .miniFondo' (event, template) {
    template.$('.miniFondo').removeClass('visible')
  },
  'click .establecerStatus' (event, template) {
    event.stopPropagation()
    const administrarClip = ventanas.findOne('administrarClip')
    const clip = clips.findOne({
      url: administrarClip.url
    })
    Meteor.call('establecerStatus', {
      postId: this._id,
      clipId: clip._id,
      secreto: administrarClip.secreto,
      status: event.currentTarget.dataset.status
    }, ventanas.error)
  },
  'click .eliminar' () {
    const administrarClip = ventanas.findOne('administrarClip')
    const clip = clips.findOne({
      url: administrarClip.url
    })
    Meteor.call('eliminarPost', {
      postId: this._id,
      clipId: clip._id,
      secreto: administrarClip.secreto
    }, ventanas.error)
  }
})

Template.adminPost.helpers({
  comprobarStatus (status) {
    Template.currentData()
    if (this.status === status) {
      return true
    }
  }
})
