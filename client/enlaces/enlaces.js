import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'

Template.agregarEnlace.helpers({
  oculto () {
    Template.currentData()
    return this.link ? '' : 'oculto'
  }
})
Template.agregarEnlace.events({
  'input input' (event) {
    ventanas.update('agregarEnlace', {
      $set: {
        link: event.currentTarget.value
      }
    })
    ventanas.updateUrl()
  },
  'click button' (event) {
    ventanas.close('agregarEnlace')
    Meteor.call('previsualizar', this.link, (e, r) => {
      if (e) {
        return ventanas.error({
          message: 'Error al obtener previsualización, inténtalo dentro de unos minutos.'
        })
      }
      ventanas.insert({
        _id: 'previsualizarEnlace',
        link: this.link,
        OG: r.data,
        url: this.url,
        secreto: this.secreto
      })
    })
  }
})

Template.previsualizarEnlace.events({
  'click .siguiente' () {
    ventanas.wait('previsualizarEnlace')
    Meteor.call('agregarLink', {
      url: this.url,
      secreto: this.secreto,
      link: this.link,
      OG: this.OG
    }, (e, r) => {
      if (e) {
        ventanas.unwait('previsualizarEnlace')
        return ventanas.error(e)
      }
      if (!this.secreto) {
        ventanas.insert({
          template: 'alerta',
          titulo: 'Publicación agregada',
          contenido: 'La publicación ha sido agregada y será visible en cuanto sea aprobada por los moderadores del clip.'
        })
      }
      ventanas.close('previsualizarEnlace')
    })
  }
})

Template.previsualizacion.onRendered(function () {
})
Template.previsualizacion.helpers({
  icono () {
    switch (this.OG.ogSiteName) {
      case 'YouTube':
        return 'centrar fab fa-youtube'
      default:
    }
  }
})
