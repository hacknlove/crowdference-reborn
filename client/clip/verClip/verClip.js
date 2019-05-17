import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'
import { clips, posts, favoritos } from '/common/baseDeDatos'
import { Meteor } from 'meteor/meteor'

Template.menuVerClip.helpers({
  miClip () {
    return favoritos.findOne(ventanas.conf('clipId'))
  },
  llaves () {
    return favoritos.findOne({
      _id: ventanas.conf('clipId'),
      secreto: {
        $exists: 1
      }
    })
  }
})
Template.menuVerClip.events({
  'click .recordar' () {
    favoritos.insert({
      _id: ventanas.conf('clipId'),
      ultimoAcceso: new Date()
    })
  },
  'click .olvidar' () {
    favoritos.remove(ventanas.conf('clipId'))
  }
})

Template.verClip.onCreated(function () {
  this.subscribe('clipUrl', this.data.url)
  this.autorun(() => {
    const clip = clips.findOne({
      url: this.data.url
    }, {
      fields: {
        _id: 1
      }
    })
    if (!clip) {
      return
    }
    ventanas.conf('clipId', clip._id)
    Meteor.subscribe('postsVisibles', clip._id)
    const miClip = favoritos.findOne(clip._id, {
      fields: {
        secreto: 1
      }
    })
    if (!miClip) {
      return
    }
    Meteor.subscribe('postsNoVisibles', {
      clipId: clip._id,
      secreto: miClip.secreto
    })
  })
  ventanas.conf('path', `/c/${this.data.url}`)
})
Template.verClip.onDestroyed(function () {
  ventanas.conf('clipId', false)
})
Template.verClip.helpers({
  clip () {
    return clips.findOne({
      url: this.url
    })
  },
  posts () {
    const clip = clips.findOne({
      url: this.url
    })
    if (!clip) {
      return
    }
    return posts.find({
      clipId: clip._id
    }, {
      sort: {
        prioridad: -1,
        timestamp: -1
      }
    })
  }
})

Template.previaClip.onCreated(function () {
  Meteor.subscribe('primerPost', this.data._id)
})
Template.previaClip.helpers({
  linkId () {
    return (posts.findOne({
      clipId: this._id
    }, {
      sort: {
        timestamp: -1
      }
    }) || {}).linkId
  }
})
