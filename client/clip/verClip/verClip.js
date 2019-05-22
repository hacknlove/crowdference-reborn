import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'
import { clips, posts, favoritos, localLinks } from '/common/baseDeDatos'
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
  this.subscribe('primerPost', this.data.clip._id)
})
Template.previaClip.helpers({
  linkId () {
    return (posts.findOne({
      clipId: this.clip._id
    }, {
      sort: {
        timestamp: -1
      }
    }) || {}).linkId
  }
})

Template.agregarEnlace2.events({
  'click .previsualizar' (event, template) {
    const url = template.$('input').val().trim()
    if (!url) {
      return
    }
    var link = localLinks.findOne({
      url
    }, {
      fields: {
        _id: 1
      }
    })
    if (link) {
      return ventanas.update('verClip', {
        $set: {
          linkId: link._id
        }
      })
    }
    Meteor.call('link', url, (e, r) => {
      if (e) {
        return ventanas.error({
          message: 'Error al obtener previsualización, inténtalo dentro de unos minutos.'
        })
      }
      localLinks.insert(r)
      ventanas.update('verClip', {
        $set: {
          linkId: r._id
        }
      })
    })
  },
  'click .aceptar' () {
    Meteor.call('agregarPost', {
      clipId: ventanas.conf('clipId'),
      linkId: this.linkId
    }, (e, r) => {
      if (e) {
        return ventanas.error(e)
      }
      ventanas.insert({
        template: 'alerta',
        titulo: 'Enlace agregado',
        contenido: 'El enlace ha sido agregado y será visible públicamente en cuanto sea aprobado.'
      })
      ventanas.update('verClip', {
        $unset: {
          linkId: 1
        }
      })
    })

  },
  'click .cancelar' () {
    ventanas.update('verClip', {
      $unset: {
        linkId: 1
      }
    })
  },
  'submit form' (event, template) {
    event.preventDefault()
    template.$('i').trigger('click')
  }
})
