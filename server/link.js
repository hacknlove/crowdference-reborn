import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'
import { links } from '/common/baseDeDatos'
import { salirValidacion } from '/server/comun'

import ogs from 'open-graph-scraper'
import Joi from 'joi'

const validaciones = {
  string: Joi.string()
}

const meteorOGS = Meteor.wrapAsync(function (opciones, callback) {
  ogs(opciones, function (e, r) {
    if (e) {
      return callback(null, [])
    }
    callback(null, r)
  })
})

const rrss = {
  Instagram (response) {
    response.description = response.title.replace(/^.*?on Instagram: /, '')
    response.title = response.title.replace(/on Instagram:.*$/, '')
    return response
  },
  Twitter (response) {
    response.title = response.title.replace(/on Twitter$/, '')
    return response
  },
  reddit (response) {
    response.description = response.title.replace(/^.*?- /, '')
    response.title = response.title.replace(/ - .*$/, '')
    return response
  }
}

const siteNameFromUrl = function siteNameFromUrl (url) {
  url = url.match(siteNameFromUrl.regex)
  return url[2]
}
siteNameFromUrl.regex = /^http(?:s?):\/\/([0-9a-z-]*\.)?([0-9a-z-]+\.[0-9a-z-]+)(?:\/|$)/
const actualizar = function actualizar (url) {
  var response
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

  response = meteorOGS(opciones)

  if (!response) {
    return
  }

  if (url.match(/https:\/\/www.facebook/)) {
    response.data.ogSiteName = 'Facebook'
  }

  if (response.data.ogUrl) {
    url = Array.from(new Set([response.data.ogUrl, url]))
  } else {
    url = [url]
  }

  response = {
    description: response.data.ogDescription,
    title: response.data.ogTitle,
    image: (response.data.ogImage || {}).url,
    type: response.data.ogType,
    url: url,
    siteName: response.data.ogSiteName || response.data.twitterSite || siteNameFromUrl(url[0])
  }

  if (rrss[response.siteName]) {
    return rrss[response.siteName](response)
  }
  return response
}

const insertar = function insertar (link) {
  const l = links.findOne({
    url: {
      $in: link.url
    }
  })

  if (l) {
    links.update(l._id, {
      $addToSet: {
        url: {
          $each: link.url
        }
      }
    })
    return l
  }
  link.actualizado = new Date()
  link._id = links.insert(link)
  return link
}

Meteor.methods({
  link (url) {
    salirValidacion({
      data: url,
      schema: validaciones.string
    })

    return links.findOne({
      url
    }) || insertar(actualizar(url))
  },
  linkId (_id) {
    salirValidacion({
      data: _id,
      schema: validaciones.string
    })

    return links.findOne(_id)
  }
})
