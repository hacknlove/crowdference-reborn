import cheerio from 'cheerio'
import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import moment from 'moment'
import ogs from 'open-graph-scraper'

const meteorOGS = Meteor.wrapAsync(function (opciones, callback) {
  ogs(opciones, function (e, r, h) {
    callback(e, [r, cheerio.load(h ? h.body : opciones.html)])
  })
})

const rrss = {
  Instagram: {
    obtenerApoyos ($, response) {
      response.data.crLikes = JSON.parse($('script[type="application/ld+json"]').html()).interactionStatistic.userInteractionCount
      response.data.ogDescription = response.data.ogTitle.replace(/^.*?on Instagram: /, '')
      response.data.ogTitle = response.data.ogTitle.replace(/on Instagram:.*$/, '')
      return response
    }
  },
  YouTube: {
    regex: /(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/,
    obtenerApoyos ($, response) {
      const youtube = response.data.ogUrl.match(rrss.YouTube.regex)
      if (!youtube) {
        return response
      }
      const data = JSON.parse(HTTP.get(`https://www.googleapis.com/youtube/v3/videos?id=${youtube[2]}&key=${Meteor.settings.private.youtubeAPI}&part=statistics`).content).items[0].statistics

      response.data.crLikes = data.likeCount - data.dislikeCount
      return response
    }
  },
  Twitter: {
    obtenerApoyos ($, response) {
      var stats = $('ul.stats')
      const retweeted = (stats.find('.request-retweeted-popup').data() || { tweetStatCount: 0 }).tweetStatCount * 1
      const favorited = (stats.find('.request-favorited-popup').data() || { tweetStatCount: 0 }).tweetStatCount * 1
      response.data.crLikes = retweeted + favorited
      response.data.ogTitle = response.data.ogTitle.replace(/on Twitter$/, '')
      return response
    }
  },
  reddit: {
    obtenerApoyos ($, response) {
      response.data.crLikes = parseInt(response.data.ogDescription.replace(/ .*$/, '').replace(/,/, ''))
      response.data.ogDescription = response.data.ogTitle.replace(/^.*?- /, '')
      response.data.ogTitle = response.data.ogTitle.replace(/ - .*$/, '')
      return response
    }
  },
  Vimeo: {
    obtenerApoyos ($, response) {
      const data = JSON.parse(HTTP.get(`${response.data.ogUrl}?action=load_stat_counts`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:67.0) Gecko/20100101 Firefox/67.0',
          'Referer': response.data.ogUrl,
          'X-Requested-With': 'XMLHttpRequest'
        }
      }).content)
      response.data.crLikes = data.total_likes.raw
      return response
    }
  },
  '@meneame_net': {
    obtenerApoyos ($, response) {
      const votos = parseInt($('#newswrap').find('.votes').find('a').text())
      response.data.crLikes = votos || 0
      return response
    }
  }
}

const obtenerApoyos = function obtenerApoyos (post) {
  return (rrss[post.rrss].obtenerApoyos(post.link) || 0) * 1
}

const actualizar = function actualizar (url) {
  var response
  var html
  var opciones
  if (url.match(/https:\/\/www.facebook/)) {
    opciones = {
      html: HTTP.get(url, {
        headers: {
          'User-Agent': 'FeedFetcher-Google; (+http://www.google.com/feedfetcher.html)'
        }
      }).content
    }
  } else {
    opciones = {
      url
    }
  }
  [response, html] = meteorOGS(opciones)

  if (rrss[response.data.ogSiteName || response.data.twitterSite]) {
    return rrss[response.data.ogSiteName || response.data.twitterSite].obtenerApoyos(html, response)
  }
  return response
}

Meteor.methods({
  actualizarApoyos (clipId, forzar) {
    return
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
      clipId,
      status: 'VISIBLE'
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
  },
  previsualizar (url) {
    return actualizar(url)
  }
})
