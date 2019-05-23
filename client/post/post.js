import { Template } from 'meteor/templating'
import { links } from '/common/baseDeDatos'
import { Meteor } from 'meteor/meteor'

Template.verPost.onCreated(function () {
  this.subscribe('linkId', this.data.post.hijoId)
})
Template.verPost.events({
  'click .cabecero .miniMenu' (event, template) {
    template.$('.miniFondo').addClass('visible')
  },
  'click .miniFondo' (event, template) {
    template.$('.miniFondo').removeClass('visible')
  },
  'click .establecerStatus' (event, template) {
    event.stopPropagation()
    const miClip = favoritos.findOne(this.clipId)

    Meteor.call('establecerStatus', {
      postId: this._id,
      secreto: miClip.secreto,
      status: event.currentTarget.dataset.status
    }, e => {
      llaveRevocada(e, miClip.url)
    })
  },
  'click .eliminar' () {
    const miClip = favoritos.findOne(this.clipId)
    Meteor.call('eliminarPost', {
      postId: this._id,
      secreto: miClip.secreto
    }, e => {
      llaveRevocada(e, miClip.url)
    })
  }
})
Template.verPost.helpers({
  link () {
    return links.findOne(this.post.hijoId)
  }
})
