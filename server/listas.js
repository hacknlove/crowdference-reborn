import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion, validacionesComunes } from '/server/comun'
import Joi from 'joi'

const validaciones = {
  primerPost: Joi.string(),
  link: Joi.string()
}

Meteor.publish('ranking', function () {
  return clips.find({
    posts: {
      $gt: 0
    }
  }, {
    fields: {
      secreto: 0,
      seguridad: 0
    },
    sort: {
      actualizacion: -1
    },
    limit: 100
  })
})

Meteor.publish('busqueda', function (busqueda) {
  var regex = /(?:)/
  try {
    regex = new RegExp(busqueda)
  } catch (e) {
    regex = /$^/
  }
  return clips.find({
    titulo: regex,
    posts: {
      $gt: 0
    }
  }, {
    fields: {
      secreto: 0,
      seguridad: 0
    },
    sort: {
      actualizacion: -1
    },
    limit: 100
  })
})

Meteor.publish('primerPost', function (clipId) {
  salirValidacion({
    data: clipId,
    schema: validaciones.primerPost,
    debug: {
      donde: 'publish clip'
    }
  })

  return posts.find({
    clipId,
    status: 'VISIBLE'
  }, {
    sort: {
      prioridad: -1,
      timestamp: -1
    },
    limit: 1
  })
})

Meteor.publish('postsDelLink', function (linkId) {
  salirValidacion({
    data: linkId,
    schema: validacionesComunes._id
  })
  return posts.find({
    linkId
  }, {
    fields: {
      clipId: 1
    },
    sort: {
      timestamp: -1
    },
    limit: 100
  })
})
