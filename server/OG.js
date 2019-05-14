import { HTTP } from 'meteor/http'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { clips, posts } from '/common/baseDeDatos'
import { Meteor } from 'meteor/meteor'
import ogs from 'open-graph-scraper'

const meteorOGS = Meteor.wrapAsync(ogs)

const OG = function OG (post) {
  const html = HTTP.get(post.link, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
    }
  })
  const response = meteorOGS({
    html: html.content
  })
  return response
}

Meteor.methods({
  OG (clipId) {
    const post = posts.findOne({
      clipId
    }, {
      sort: {
        
      }
    })
    return OG(post)
  }
})
