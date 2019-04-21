/* global twttr FB instgrm */
import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'

const rrss = {
  instagram: {
    regex: /https:\/\/www\.instagram\.com\//,
    renderizar (that) {
      const contenedor = that.$('.social')
      contenedor.append(`<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${that.data.link}" data-instgrm-version="12" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"></blockquote>`)
      instgrm.Embeds.process()
    }
  },
  youtube: {
    regex: /(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/,
    renderizar (that) {
      const youtube = that.data.link.match(rrss[that.data.rrss].regex)
      if (!youtube) {
        return
      }
      const contenedor = that.$('.social')
      contenedor.append(`<div class="youtube"><iframe src="https://www.youtube.com/embed/${youtube[2]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`)
    }
  },
  twitter: {
    regex: /https:\/\/twitter\.com\/[^/]+\/status\/([0-9]+)$/,
    renderizar (that) {
      var twitter = that.data.link.match(rrss[that.data.rrss].regex)
      if (!twitter) {
        return
      }
      const contenedor = that.$('.social')
      twttr.widgets.createTweet(
        twitter[1],
        contenedor[0]
      )
    }
  },
  facebook: {
    regex: /https:\/\/www\.facebook\.com\//,
    renderizar (that) {
      const contenedor = that.$('.social')
      contenedor.append(`<div class="fb-post" data-href="${that.data.link}"></div>`)
      FB.XFBML.parse(contenedor[0])
    }
  }
}
const detectarRRSS = function (link) {
  return Object.keys(rrss).find((key) => {
    return link.match(rrss[key].regex)
  })
}
Template.agregarSocial.helpers({
  oculto () {
    console.log(detectarRRSS(this.link))
    Template.currentData()
    return detectarRRSS(this.link) ? '' : 'oculto'
  }
})
Template.agregarSocial.events({
  'input input' (event) {
    ventanas.update('agregarSocial', {
      $set: {
        link: event.currentTarget.value
      }
    })
    ventanas.updateUrl()
  },
  'click button' (event) {
    ventanas.close('agregarSocial')

    ventanas.insert({
      _id: 'previsualizarSocial',
      link: this.link,
      rrss: detectarRRSS(this.link)
    })
  }
})

Template.previsualizarSocial.helpers({
  rrss () {
    return rrss[this.rrss]
  }
})
Template.previsualizarSocial.onRendered(function () {
  rrss[this.data.rrss].renderizar(this)
})
