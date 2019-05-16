import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion, salir } from '/server/comun'

import Joi from 'joi'

const validaciones = {
  agregarPost: Joi.object().keys({
    clipId: Joi.string().required(),
    linkId: Joi.string().required()
  }),
  cambiarPrioridad: Joi.object().keys({
    postId: Joi.string().required(),
    secreto: Joi.string().required(),
    prioridad: Joi.number().required()
  }),
  establecerStatus: Joi.object().keys({
    postId: Joi.string().required(),
    secreto: Joi.string().required(),
    status: Joi.string().valid(['RECHAZADO', 'OCULTO', 'VISIBLE']).required()
  }),
  eliminarPost: Joi.object().keys({
    postId: Joi.string().required(),
    secreto: Joi.string().required()
  }),
  postsVisibles: Joi.string(),
  postsNoVisibles: Joi.object().keys({
    clipId: Joi.string().required(),
    secreto: Joi.string().required()
  })
}

const testSecretoClip = function (opciones) {
  const post = posts.findOne({
    _id: opciones.postId
  }, {
    fields: {
      clipId: 1
    }
  }) || salir(404, 'Post no encontrado')

  const clip = clips.find({
    _id: post.clipId
  }, {
    fields: {
      secreto: 1
    }
  }) || salir(404, 'Clip no encontrado', {
    donde: 'method establecerStatus'
  })

  clip.seguridad === opciones.seguridad || salir(401, 'No tienes permiso para administrar el clip', {
    donde: 'method establecerStatus'
  })
}

Meteor.methods({
  agregarPost (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.agregarPost
    })
    clips.find({
      _id: opciones.clipId
    }).count() || salir(404, 'Clip no encontrado')

    if (posts.findOne(opciones)) {
      return
    }

    posts.insert({
      clipId: opciones.clipId,
      linkId: opciones.linkId,
      timestamp: new Date(),
      status: 'PENDIENTE',
      prioridad: 0
    })
  },
  cambiarPrioridad (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.cambiarPrioridad
    })
    testSecretoClip(opciones)

    posts.update(opciones.postId, {
      $set: {
        prioridad: opciones.prioridad
      }
    })
  },
  establecerStatus (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.establecerStatus
    })
    testSecretoClip(opciones)

    posts.update(opciones.postId, {
      $set: {
        status: opciones.status
      }
    })
  },
  eliminarPost (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.eliminarPost,
      debug: {
        donde: 'method establecerStatus'
      }
    })

    testSecretoClip(opciones)

    posts.remove(opciones.postId)
  }
})

Meteor.publish('postsVisibles', function (clipId) {
  salirValidacion({
    data: clipId,
    schema: validaciones.postsVisibles
  })

  return posts.find({
    clipId,
    status: 'VISIBLE'
  })
})
Meteor.publish('postsNoVisibles', function (opciones) {
  salirValidacion({
    data: opciones,
    schema: validaciones.postsNoVisibles
  })
  const clip = clips.findOne({
    url: opciones.url
  }) || salir(404, 'Clip no encontrado')

  clip.secreto === opciones.secreto || salir(401, 'Clave de administración no válida')

  return posts.find({
    clipId: opciones.clipId,
    status: {
      $ne: 'VISIBLE'
    }
  })
})
