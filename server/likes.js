import cheerio from 'cheerio'
import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import moment from 'moment'

const rrss = {
  instagram: {
    obtenerApoyos (url) {
      const html = HTTP.get(url)
      const $ = cheerio.load(html.content)
      return JSON.parse($('script[type="application/ld+json"]').html()).interactionStatistic.userInteractionCount
    }
  },
  youtube: {
    regex: /(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/,
    obtenerApoyos (url) {
      const youtube = url.match(rrss.youtube.regex)
      if (!youtube) {
        return
      }
      const data = JSON.parse(HTTP.get(`https://www.googleapis.com/youtube/v3/videos?id=${youtube[2]}&key=${Meteor.settings.private.youtubeAPI}&part=statistics`).content).items[0].statistics

      return data.likeCount - data.dislikeCount
    }
  },
  twitter: {
    obtenerApoyos (url) {
      const html = HTTP.get(url)
      const $ = cheerio.load(html.content)
      var stats = $('ul.stats')
      const retweeted = stats.find('.request-retweeted-popup').data().tweetStatCount * 1
      const favorited = stats.find('.request-favorited-popup').data().tweetStatCount * 1
      return retweeted + favorited
    }
  },
  facebook: {
    obtenerApoyos (url) {
      return 0
    }
  }
}

const obtenerApoyos = function obtenerApoyos (post) {
  return (rrss[post.rrss].obtenerApoyos(post.link) || 0) * 1
}

Meteor.methods({
  actualizarApoyos (clipId, forzar) {
    if (!forzar && clips.findOne({
      _id: clipId,
      actualizacion: {
        $gt: moment().subtract(1, 'hour').toDate()
      }
    })) {
      return
    }
    var apoyos = 0
    posts.find({
      clipId
    }).forEach(post => {
      const misApoyos = obtenerApoyos(post)
      posts.update({
        _id: post._id
      }, {
        $set: {
          apoyos: misApoyos
        }
      })
      apoyos += misApoyos
    })
    clips.update({
      _id: clipId
    }, {
      $set: {
        apoyos,
        actualizacion: new Date()
      }
    })
  }
})
