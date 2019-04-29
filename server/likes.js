import cheerio from 'cheerio'
import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'

const rrss = {
  instagram: {
    obtenerLikes (url) {
      const html = HTTP.get(url)
      const $ = cheerio.load(html.content)
      return JSON.parse($('script[type="application/ld+json"]').html()).interactionStatistic.userInteractionCount
    }
  },
  youtube: {
    regex: /(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/,
    obtenerLikes (url) {
      const youtube = url.match(rrss.youtube.regex)
      if (!youtube) {
        return
      }
      const data = JSON.parse(HTTP.get(`https://www.googleapis.com/youtube/v3/videos?id=${youtube[2]}&key=${Meteor.settings.private.youtubeAPI}&part=statistics`).content).items[0].statistics

      return data.likeCount - data.dislikeCount
    }
  },
  twitter: {
    obtenerLikes (url) {
      const html = HTTP.get(url)
      const $ = cheerio.load(html.content)
      var stats = $('ul.stats')
      const retweeted = stats.find('.request-retweeted-popup').data().tweetStatCount * 1
      const favorited = stats.find('.request-favorited-popup').data().tweetStatCount * 1
      return retweeted + favorited
    }
  },
  facebook: {
    obtenerLikes (url) {
      return 0
    }
  }
}

const obtenerLikes = function obtenerLikes (post) {
  return rrss[post.rrss].obtenerLikes(post.url)
}

Meteor.methods({
  actualizarLikes (clipId) {
    const clip = clips.findOne({
      clipId
    })
    posts.find({
      clipId
    }).forEach(post => {

      console.log(post)
    })
  }
})
