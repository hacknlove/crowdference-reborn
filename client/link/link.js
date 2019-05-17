import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { clips, posts, localLinks } from '/common/baseDeDatos'
import { Template } from 'meteor/templating'

Template.link.onCreated(function () {
  Meteor.subscribe('link', this.data.link)
})

Template.link.helpers({
  post () {
    return posts.findOne({
      link: this.data.link
    }, {
      fields: {
        clipId: 0
      }
    })
  },
  clips () {
    return clips.find({}, {
      sort: {
        actualizacion: -1
      }
    })
  }
})

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
    Meteor.call('link', this.link, (e, r) => {
      if (e) {
        return ventanas.error({
          message: 'Error al obtener previsualización, inténtalo dentro de unos minutos.'
        })
      }
      ventanas.insert({
        _id: 'previsualizarEnlace',
        link: r
      })
    })
  }
})

Template.previsualizarEnlace.events({
  'click .siguiente' () {
    ventanas.wait('previsualizarEnlace')
    Meteor.call('agregarPost', {
      clipId: ventanas.conf('clipId'),
      linkId: this.link._id
    }, (e, r) => {
      if (e) {
        ventanas.unwait('previsualizarEnlace')
        return ventanas.error(e)
      }
      if (!this.secreto) {
        ventanas.insert({
          template: 'alerta',
          titulo: 'Enlace agregado',
          contenido: 'El enlace ha sido agregado y será visible públicamente en cuanto sea aprobado.'
        })
      }
      ventanas.close('previsualizarEnlace')
    })
  }
})

const iconos = {
  YouTube: 'fab fa-youtube',
  Vimeo: 'fab fa-vimeo',
  Facebook: 'fab fa-facebook',
  Twitter: 'fab fa-twitter',
  Instagram: 'fab fa-instagram',
  reddit: 'fab fa-reddit',
  'wikipedia.org': 'fab fa-wikipedia-w'
}

Template.mostrarLink.onCreated(function () {
  this.autorun(() => {
    const data = Template.currentData()
    if (!data.linkId) {
      return
    }
    if (localLinks.findOne(data.linkId)) {
      return
    }
    Meteor.call('linkId', data.linkId, function (e, r) {
      localLinks.insert(r)
    })
  })
})
Template.mostrarLink.helpers({
  link () {
    return localLinks.findOne(this.linkId)
  },
  icono () {
    if (!this.link) {
      return
    }
    return iconos[this.link.siteName] || 'fas fa-external-link-alt'
  },
  favicon () {
    return this.link.url.replace(/^(.*:\/\/.*?)\/(.*)$/, '$1/favicon.ico')
  }
})
