/* global twttr FB */
import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.youtube.onCreated(function () {
  this.autorun(() => {
    var youtube = ventanas.conf('youtube') || ''
    youtube = youtube.match(/(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/)
    if (!youtube) {
      ventanas.update('pregunta', {
        $unset: {
          youtubeId: 1
        }
      })
      return
    }
    ventanas.update('pregunta', {
      $set: {
        youtubeId: youtube[2]
      }
    })
  })
})

Template.twitter.onRendered(function () {
  const contenedor = this.$('.twitter')
  this.autorun(() => {
    var twitter = ventanas.conf('twitter') || ''
    twitter = twitter.match(/https:\/\/twitter\.com\/[^/]+\/status\/([0-9]+)$/)
    if (!twitter) {
      return contenedor.empty()
    }
    console.log(twitter[1])
    twttr.widgets.createTweet(
      twitter[1],
      contenedor[0]
    )
  })
})

Template.facebook.onRendered(function () {
  const contenedor = this.$('.facebook')
  this.autorun(() => {
    var facebook = ventanas.conf('facebook') || ''
    console.log(facebook)
    contenedor.empty()
    if (!facebook.match(/https:\/\/www\.facebook\.com\/[^/]+\/(posts|permalink)\/[0-9]+$/)) {
      return
    }
    console.log(facebook)
    contenedor.append(`<div class="fb-post" data-href="${facebook}" data-width="350"></div>`)
    FB.XFBML.parse(contenedor[0])
  })
})
