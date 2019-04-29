import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'
import { clips, posts } from '/common/baseDeDatos'

ventanas.use('/:url', function (match, v) {
  return v.push({
    _id: 'verClip',
    url: match.url
  })
})

Template.verClip.onCreated(function () {
  this.subscribe('clip', {
    url: this.data.url
  })
  ventanas.conf('path', `/${this.data.url}`)
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
    })
  }
})

Template.menuVerClip.events({
  'click .salir' () {
    ventanas.close('verClip')
    ventanas.insert({
      _id: 'portada'
    })
  }
})
