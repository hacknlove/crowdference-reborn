/* global __meteor_runtime_config__ */

import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'
import { clips, posts, misClips, localLinks } from '/common/baseDeDatos'
import { Meteor } from 'meteor/meteor'
import ClipboardJS from 'clipboard'

const llaveRevocada = function llaveRevocada (e, url) {
  if (!e) {
    return
  }
  console.log('llaveRevocada')
  if (e.error !== 401) {
    return ventanas.error(e)
  }
  const miClip = misClips.findOne({
    url: url,
    seguridad: {
      $exists: 1
    }
  })

  if (!miClip) {
    ventanas.insert({
      template: 'alerta',
      titulo: 'Llave no válida',
      contenido: 'Tú llave ha sido revocada'
    })
    return misClips.update({
      url
    }, {
      $unset: {
        secreto: 1
      }
    })
  }
  Meteor.call('obtenerSecreto', {
    clipId: miClip._id,
    seguridad: miClip.seguridad
  }, (e, r) => {
    if (!e) {
      return misClips.update({
        url
      }, {
        $set: {
          secreto: r
        }
      })
    }
    if (e.error === 401) {
      misClips.update({
        url
      }, {
        $unset: {
          seguridad: 1
        }
      })
    }
    llaveRevocada(e, url)
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
  },
  llaves () {
    const url = (ventanas.findOne('verClip') || {}).url
    return misClips.findOne({
      url,
      $or: [
        {
          secreto: {
            $exists: 1
          }
        },
        {
          seguridad: {
            $exists: 1
          }
        }
      ]
    })
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
    const miClip = misClips.findOne(clip._id, {
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
  ventanas.conf('path', `/${this.data.url}`)
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

Template.vistaPreviaPost.onCreated(function () {
  if (!localLinks.findOne(this.data.linkId)) {
    Meteor.call('linkId', this.data.linkId, (e, r) => {
      if (e) {
        console.log(e)
      }
      localLinks.insert(r)
    })
  }
})
Template.vistaPreviaPost.onRendered(function () {
  const that = this
  this.clipboard = new ClipboardJS(this.$('.copiar')[0], {
    text () {
      return `${__meteor_runtime_config__.ROOT_URL}link/${encodeURIComponent(that.data.link)}`
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
Template.vistaPreviaPost.events({
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
      secreto: miClip.secreto
    }, e => {
      llaveRevocada(e, miClip.url)
    })
  }
})
Template.vistaPreviaPost.helpers({
  link () {
    return localLinks.findOne(this.linkId)
  },
  admin () {
    return misClips.findOne({
      _id: this.clipId,
      secreto: {
        $exists: 1
      }
    })
  },
  comprobarStatus (status) {
    Template.currentData()
    if (this.status === status) {
      return true
    }
  },
  clips () {
    return 4
  }
})

Template.llaves.onRendered(function () {
  this.clipboard = new ClipboardJS('i.copiar', {
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
    const miClip = misClips.findOne(ventanas.conf('clipId')) || {}
    return miClip.seguridad
  },
  secreto () {
    const miClip = misClips.findOne(ventanas.conf('clipId')) || {}
    return miClip.secreto
  }
})

Template.prioridad.helpers({
  prioridad () {
    return posts.findOne(this.postId).prioridad
  }
})

Template.prioridad.events({
  'click .aceptar' (event, template) {
    const miClip = misClips.findOne(ventanas.conf('clipId'))
    ventanas.wait(this._id)
    Meteor.call('cambiarPrioridad', {
      secreto: miClip.secreto,
      postId: this.postId,
      prioridad: template.$('input').val() * 1
    }, (e) => {
      if (e) {
        return ventanas.error(e)
      }
      ventanas.close(this)
    })
  }
})
