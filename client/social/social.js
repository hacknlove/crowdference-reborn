/* global twttr FB instgrm */
import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'

const rrss = {
  youtube: {
    agregarSocialTitulo: 'Agregar video de youtube',
    previsualizarSocialTitulo: 'Previsualizar video de youtube',
    checkRegExp: /(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/,
    placeholder: 'https://www.youtube.com/watch?v=...',
    previsualizarSocialOnRendered (that) {
      const youtube = that.data.link.match(rrss[that.data.rrss].checkRegExp)
      if (!youtube) {
        return
      }
      const contenedor = that.$('.cuerpo')
      contenedor.append(`<div class="youtube"><iframe src="https://www.youtube.com/embed/${youtube[2]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`)
    }
  },
  twitter: {
    agregarSocialTitulo: 'Agregar twit',
    previsualizarSocialTitulo: 'Previsualizar twit',
    checkRegExp: /https:\/\/twitter\.com\/[^/]+\/status\/([0-9]+)$/,
    placeholder: 'https://twitter.com/.../status/...',
    previsualizarSocialOnRendered (that) {
      var twitter = that.data.link.match(rrss[that.data.rrss].checkRegExp)
      if (!twitter) {
        return
      }
      const contenedor = that.$('.cuerpo')
      twttr.widgets.createTweet(
        twitter[1],
        contenedor[0]
      )
    }
  },
  facebook: {
    agregarSocialTitulo: 'Agregar post de facebook',
    previsualizarSocialTitulo: 'Previsualizar post de facebook',
    checkRegExp: /https:\/\/www\.facebook\.com\/[^/]+\/(posts|permalink)\/[0-9]+$/,
    placeholder: 'https://www.facebook.com/.../posts/...',
    previsualizarSocialOnRendered (that) {
      const contenedor = that.$('.cuerpo')
      contenedor.append(`<div class="fb-post" data-href="${that.data.link}" data-width="350"></div>`)
      FB.XFBML.parse(contenedor[0])
    }
  },
  instagram: {
    agregarSocialTitulo: 'Agregar post de instagram',
    previsualizarSocialTitulo: 'Previsualizar post de instagram',
    checkRegExp: /https:\/\/www\.instagram\.com\/p\/\w+$/,
    placeholder: 'https://www.instagram.com/p/.../'
  }
}

Template.agregarSocial.helpers({
  rrss () {
    return rrss[this.rrss]
  },
  oculto () {
    Template.currentData()
    return this.link.match(rrss[this.rrss].checkRegExp) ? '' : 'oculto'
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
      rrss: this.rrss
    })
  }
})

Template.previsualizarSocial.helpers({
  rrss () {
    return rrss[this.rrss]
  }
})
Template.previsualizarSocial.onRendered(function () {
  rrss[this.data.rrss].previsualizarSocialOnRendered(this)
})

// Template.instagram.onRendered(function () {
//   const contenedor = this.$('.facebook')
//   this.autorun(() => {
//     var instagram = ventanas.conf('instagram') || ''
//     console.log(instagram)
//     contenedor.empty()
//     if (!instagram.match(/https:\/\/www\.instagram\.com\/p\/\w+$/)) {
//       return
//     }
//     console.log(instagram)
//     contenedor.append(`<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${instagram}" data-instgrm-version="12" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
//     </blockquote>`)
//     instgrm.Embeds.process()
//   })
// })
