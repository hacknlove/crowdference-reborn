import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { posts, localLinks } from '/common/baseDeDatos'
import { Template } from 'meteor/templating'

Template.link.onCreated(function () {
  this.autorun(() => {
    const link = localLinks.findOne({
      url: this.data.link
    })
    if (!link) {
      return Meteor.call('link', this.data.link, (e, r) => {
        if (e) {
          return ventanas.error(e)
        }
        const _id = r._id
        delete r._id
        localLinks.upsert(_id, {
          $set: r
        })
      })
    }
    Meteor.subscribe('postsDelLink', link._id)
  })
  ventanas.conf('path', `/l/${encodeURIComponent(this.data.link)}`)
})

Template.link.helpers({
  linkId () {
    const link = localLinks.findOne({
      url: this.link
    })
    if (!link) {
      return
    }
    return link._id
  },
  posts () {
    return Array.from(new Set(posts.find({}, {
      sort: {
        timestamp: -1
      }
    }).map(p => p.clipId)))
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
    var link = localLinks.findOne({
      url: this.link
    })
    if (link) {
      return ventanas.insert({
        _id: 'previsualizarEnlace',
        linkId: link._id
      })
    }
    Meteor.call('link', this.link, (e, r) => {
      if (e) {
        return ventanas.error({
          message: 'Error al obtener previsualización, inténtalo dentro de unos minutos.'
        })
      }
      localLinks.insert(r)
      ventanas.insert({
        _id: 'previsualizarEnlace',
        linkId: r._id
      })
    })
  }
})

Template.previsualizarEnlace.events({
  'click .siguiente' () {
    ventanas.wait('previsualizarEnlace')
    Meteor.call('agregarPost', {
      clipId: ventanas.conf('clipId'),
      linkId: this.linkId
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
  href () {
    if (this.href) {
      return `/c/${this.href}`
    }
    const link = localLinks.findOne(this.linkId)
    if (!link) {
      return
    }
    return `/l/${encodeURIComponent(link.url[0])}`
  },
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
Template.mostrarLink.events({
  'click img' () {
    if (this.clipUrl) {
      ventanas.close('link')
      ventanas.close('ranking')
      ventanas.close('busqueda')
      ventanas.insert({
        _id: 'verClip',
        url: this.clipUrl,
        exclusive: true
      })
      return
    }
    const link = localLinks.findOne(this.linkId)
    if (ventanas.findOne('verClip')) {
      ventanas.close('verClip')
      return ventanas.insert({
        _id: 'link',
        link: link.url[0]
      })
    }
    window.open(link.url[0], '_blank')
  }
})
