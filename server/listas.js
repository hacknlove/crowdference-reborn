import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion } from '/server/comun'
import Joi from 'joi'

const validaciones = {
  primerPost: Joi.string()
}

Meteor.publish('ranking', function (pagina = 0) {
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
      apoyos: -1
    },
    skip: 10 * pagina,
    limit: 10
  })
})

Meteor.publish('busqueda', function (busqueda, pagina = 0) {
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
      apoyos: -1
    },
    skip: 10 * pagina,
    limit: 10
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
