/* global __meteor_runtime_config__ */

import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import ClipboardJS from 'clipboard'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { favoritos } from '/common/baseDeDatos'

Template.llaves.onCreated(function () {
  if (this.data.seguridad) {
    favoritos.upsert(this.data.clipId, {
      $set: {
        seguridad: this.data.seguridad
      }
    })
  }
  if (this.data.secreto) {
    favoritos.upsert(this.data.clipId, {
      $set: {
        secreto: this.data.secreto
      }
    })
    Meteor.call('clipIdToUrl', this.data.clipId, (e, r) => {
      if (e) {
        return ventanas.error(e)
      }
      ventanas.remove('llaves')
      ventanas.insert({
        _id: 'verClip',
        url: r
      })
      ventanas.insert({
        _id: 'llaves',
        clipId: this.data.clipId
      })
    })
  }
  this.autorun(() => {
    const _id = ventanas.conf('clipId')
    if (!_id) {
      return
    }
    if (favoritos.findOne({
      _id,
      secreto: {
        $exists: 1
      }
    })) {
      return
    }
    ventanas.close('llaves')
  })
})

Template.llaves.onRendered(function () {
  this.clipboard = new ClipboardJS('i.copiar', {
    text (element) {
      const miClip = favoritos.findOne(ventanas.conf('clipId'))
      switch (element.dataset.llave) {
        case 'secreto':
          return `${__meteor_runtime_config__.ROOT_URL}k/${miClip._id}/${miClip.secreto}`
        case 'seguridad':
          return `${__meteor_runtime_config__.ROOT_URL}k/${miClip._id}/${miClip.secreto}/${miClip.seguridad}`
      }
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
    favoritos.update(ventanas.conf('clipId'), {
      $unset: {
        [event.currentTarget.dataset.llave]: 1
      }
    })
  },
  'click .revocar' (event) {
    const verClip = ventanas.findOne('verClip')
    const miClip = favoritos.findOne({
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
      favoritos.update({
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
    const miClip = favoritos.findOne(ventanas.conf('clipId')) || {}
    return miClip.seguridad
  },
  secreto () {
    const miClip = favoritos.findOne(ventanas.conf('clipId')) || {}
    return miClip.secreto
  }
})
