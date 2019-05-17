/* global __meteor_runtime_config__ */
import { Template } from 'meteor/templating'
import { posts, favoritos } from '/common/baseDeDatos'
import { Meteor } from 'meteor/meteor'
import ClipboardJS from 'clipboard'
import { ventanas } from 'meteor/hacknlove:ventanas'

const llaveRevocada = function llaveRevocada (e, url) {
  if (!e) {
    return
  }
  console.log('llaveRevocada')
  if (e.error !== 401) {
    return ventanas.error(e)
  }
  const miClip = favoritos.findOne({
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
    return favoritos.update({
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
      return favoritos.update({
        url
      }, {
        $set: {
          secreto: r
        }
      })
    }
    if (e.error === 401) {
      favoritos.update({
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

Template.verPost.onRendered(function () {
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
Template.verPost.events({
  'click .cabecero .fa-bars' (event, template) {
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

Template.prioridad.helpers({
  prioridad () {
    return posts.findOne(this.postId).prioridad
  }
})

Template.prioridad.events({
  'click .aceptar' (event, template) {
    const miClip = favoritos.findOne(ventanas.conf('clipId'))
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
