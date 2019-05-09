/* global __meteor_runtime_config__ */

import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'
import { clips, posts, misClips } from '/common/baseDeDatos'
import { Meteor } from 'meteor/meteor'
import ClipboardJS from 'clipboard'

const llaveRevocada = function llaveRevocada (e, url) {
  if (!e) {
    return
  }
  if (e.error !== 401) {
    return ventanas.error(e)
  }

  ventanas.insert({
    template: 'alerta',
    titulo: 'Llave no válida',
    contenido: 'Tú llave de administración ha sido revocada'
  })
  misClips.update({
    url
  }, {
    $unset: {
      secreto: 1
    }
  })
}

ventanas.use('/:url', function (match, v) {
  return v.push({
    _id: 'verClip',
    url: match.url
  })
})

ventanas.use('/:url/:clipId/:llave/:tipo', function (match, v) {
  setTimeout(function () {
    misClips.upsert({
      _id: match.clipId,
      url: match.url
    }, {
      $set: {
        [match.tipo]: match.llave
      }
    })
  }, 1000)
  v.push({
    _id: 'verClip',
    url: match.url
  })
  return v.push({
    _id: 'llaves',
    url: match.url
  })
})

Template.menuVerClip.helpers({
  url () {
    return (ventanas.findOne('verClip') || {}).url
  }
})
Template.menuVerClip.events({
  'click .salir' () {
    ventanas.close('verClip')
    ventanas.insert({
      _id: 'portada'
    })
  },
  'click .recordar' () {
    const verClip = ventanas.findOne('verClip')
    const clip = clips.findOne({
      url: verClip.url
    })
    misClips.insert({
      _id: clip._id,
      titulo: clip.titulo,
      url: clip.titulo,
      ultimoAcceso: new Date()
    })
  },
  'click .olvidar' () {
    const verClip = ventanas.findOne('verClip')
    misClips.remove({
      url: verClip.url
    })
  }
})

Template.verClip.onCreated(function () {
  this.autorun(() => {
    const query = {
      url: this.data.url
    }
    const miclip = misClips.findOne(query) || {}
    if (miclip.secreto) {
      query.secreto = miclip.secreto
    }
    Meteor.subscribe('clip', query, {
      onStop: (e) => {
        return llaveRevocada(e, this.data.url)
      }
    })
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

Template.adminPost.events({
  'click .cabecero .fa-bars' (event, template) {
    template.$('.miniFondo').addClass('visible')
  },
  'click .miniFondo' (event, template) {
    template.$('.miniFondo').removeClass('visible')
  },
  'click .establecerStatus' (event, template) {
    event.stopPropagation()
    const miClip = misClips.findOne(this.clipId)

    Meteor.call('establecerStatus', {
      postId: this._id,
      clipId: this.clipId,
      secreto: miClip.secreto,
      status: event.currentTarget.dataset.status
    }, e => {
      llaveRevocada(e, miClip.url)
    })
  },
  'click .eliminar' () {
    const miClip = misClips.findOne(this.clipId)
    Meteor.call('eliminarPost', {
      postId: this._id,
      clipId: this.clipId,
      secreto: miClip.secreto
    }, e => {
      llaveRevocada(e, miClip.url)
    })
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

Template.llaves.onRendered(function () {
  this.clipboard = new ClipboardJS('button.copiar', {
    text (element) {
      const verClip = ventanas.findOne('verClip')
      const miClip = misClips.findOne({
        url: verClip.url
      }) || {}
      return `${__meteor_runtime_config__.ROOT_URL}${miClip.url}/${miClip._id}/${miClip[element.dataset.llave]}/${element.dataset.llave}`
    }
  })
  this.clipboard.on('success', (event) => {
    ventanas.insert({
      template: 'alerta',
      titulo: 'copiado',
      contenido: `La url de la llave se ha copiado al portapapeles.`
    })
    ventanas.update('mostrarSecreto', {
      $addToSet: {
        copiado: event.trigger.title
      }
    })
  })
})
Template.llaves.events({
  'click .olvidar' (event) {
    const verClip = ventanas.findOne('verClip')
    misClips.update({
      url: verClip.url
    }, {
      $unset: {
        [event.currentTarget.dataset.llave]: 1
      }
    })
  },
  'click .revocar' (event) {
    const verClip = ventanas.findOne('verClip')
    const miClip = misClips.findOne({
      url: verClip.url
    })
    Meteor.call('revocar', {
      clipId: miClip._id,
      llave: event.currentTarget.dataset.llave,
      seguridad: miClip.seguridad
    }, (e, r) => {
      if (e) {
        return ventanas.error(e)
      }
      misClips.update({
        url: verClip.url
      }, {
        $set: {
          [event.currentTarget.dataset.llave]: r
        }
      })
    })
  }
})
Template.llaves.helpers({
  seguridad () {
    const verClip = ventanas.findOne('verClip')
    const miClip = misClips.findOne({
      url: verClip.url
    }) || {}
    return miClip.seguridad
  },
  secreto () {
    const verClip = ventanas.findOne('verClip')
    const miClip = misClips.findOne({
      url: verClip.url
    }) || {}
    return miClip.secreto
  }
})
