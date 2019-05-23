import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { posts, links } from '/common/baseDeDatos'
import { Template } from 'meteor/templating'
import { fingerprint } from '/client/fingerprint'

Template.link.onCreated(function () {
  this.subscribe('posts', this.data.link._id)
  ventanas.conf('path', `/l/${encodeURIComponent(this.data.link.url[0])}`)
})

Template.link.helpers({
  posts () {
    return posts.find({
      padreId: this.link._id
    }, {
      sort: {
        votos: -1
      }
    })
  }
})

Template.agregarEnlace.events({
  'click .previsualizar' (event, template) {
    const url = template.$('input').val().trim()
    if (!url) {
      return
    }
    Meteor.call('link', url, (e, r) => {
      if (e) {
        return ventanas.error({
          message: 'Error al obtener previsualización, inténtalo dentro de unos minutos.'
        })
      }
      ventanas.update('link', {
        $set: {
          hijoLink: r
        }
      })
    })
  },
  'click .aceptar' () {
    Meteor.call('agregarPost', {
      padreId: this.padreId,
      hijoId: this.hijoLink._id,
      fingerprint
    }, (e, r) => {
      if (e) {
        return ventanas.error(e)
      }
      ventanas.insert({
        template: 'alerta',
        titulo: 'Enlace agregado',
        contenido: 'El enlace ha sido agregado y será visible públicamente en cuanto sea aprobado.'
      })
      ventanas.update('link', {
        $unset: {
          hijoLink: 1
        }
      })
    })
  },
  'click .cancelar' () {
    ventanas.update('link', {
      $unset: {
        hijoLink: 1
      }
    })
  },
  'submit form' (event, template) {
    event.preventDefault()
    template.$('i').trigger('click')
  }
})

Template.previaLink.events({
  'click .ir' () {
    ventanas.insert({
      _id: 'link',
      link: this.link
    })
    ventanas.close(this.closeOther)
  }
})

// Template.menuVerClip.helpers({
//   miClip () {
//     return favoritos.findOne(ventanas.conf('clipId'))
//   }
// })
// Template.menuVerClip.events({
//   'click .recordar' () {
//     favoritos.insert({
//       _id: ventanas.conf('clipId'),
//       ultimoAcceso: new Date()
//     })
//   },
//   'click .olvidar' () {
//     favoritos.remove(ventanas.conf('clipId'))
//   }
// })
