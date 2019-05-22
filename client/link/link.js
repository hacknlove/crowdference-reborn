import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { posts, links } from '/common/baseDeDatos'
import { Template } from 'meteor/templating'
import { fingerprint } from '/client/fingerprint'

Template.link.onCreated(function () {
  this.subscribe('linkId', this.data.linkId)
  this.subscribe('posts', this.data.linkId)
  ventanas.conf('path', `/l/${encodeURIComponent(this.data.link)}`)
})

Template.link.helpers({
  posts () {
    return posts.find({
      padreId: this.linkId
    }, {
      sort: {
        votos: -1
      }
    })
  }
})

Template.mostrarLink.helpers({
  link () {
    return links.findOne(this.linkId)
  }
})

Template.agregarEnlace.events({
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
    console.log(link)
    if (link) {
      return ventanas.update('link', {
        $set: {
          hijoId: link._id
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
      ventanas.update('link', {
        $set: {
          hijoId: r._id
        }
      })
    })
  },
  'click .aceptar' () {
    console.log(fingerprint)
    Meteor.call('agregarPost', {
      padreId: this.padreId,
      hijoId: this.hijoId,
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
          hijoId: 1
        }
      })
    })
  },
  'click .cancelar' () {
    ventanas.update('link', {
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
