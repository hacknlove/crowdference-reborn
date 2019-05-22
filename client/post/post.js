/* global __meteor_runtime_config__ */
import { Template } from 'meteor/templating'
import { posts, favoritos, localLinks } from '/common/baseDeDatos'
import { Meteor } from 'meteor/meteor'
import ClipboardJS from 'clipboard'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.verPost.onCreated(function () {
  this.autorun(() => {
    const data = Template.currentData()
    if (!data.linkId) {
      return
    }
    Meteor.subscribe('postsDelLink', data.linkId)
  })
})
Template.verPost.onRendered(function () {
  const that = this
  this.clipboard = new ClipboardJS(this.$('.copiar')[0], {
    text () {
      const link = localLinks.findOne(that.data.linkId)
      if (!link) {
        return
      }
      return `${__meteor_runtime_config__.ROOT_URL}link/${encodeURIComponent(link.url[0])}`
    }
  })
  this.clipboard.on('success', (event) => {
    ventanas.insert({
      template: 'alerta',
      titulo: 'copiado',
      contenido: 'El enlace se ha copiado al portapapeles'
    })
    ventanas.update('mostrarSecreto', {
      $addToSet: {
        copiado: event.trigger.title
      }
    })
  })
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
  admin () {
    return favoritos.findOne({
      _id: this.clipId,
      secreto: {
        $exists: 1
      }
    })
  },
  linkUrl () {
    const link = localLinks.findOne(this.linkId)
    if (!link) {
      return
    }
    return link.url[0]
  },
  comprobarStatus (status) {
    Template.currentData()
    if (this.status === status) {
      return true
    }
  },
  clips () {
    return posts.find({
      clipId: {
        $ne: this.clipId
      }
    }).count() + 1
  }
})
