import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion, salir, validacionesComunes } from '/server/comun'

import Joi from 'joi'

const validaciones = {
  agregarPost: Joi.object().keys({
    clipId: validacionesComunes._id.required(),
    linkId: validacionesComunes._id.required()
  }),
  cambiarPrioridad: Joi.object().keys({
    postId: validacionesComunes._id.required(),
    secreto: Joi.string().required(),
    prioridad: Joi.number().required()
  }),
  establecerStatus: Joi.object().keys({
    postId: validacionesComunes._id.required(),
    secreto: Joi.string().required(),
    status: Joi.string().valid(['RECHAZADO', 'OCULTO', 'VISIBLE']).required()
  }),
  eliminarPost: Joi.object().keys({
    postId: validacionesComunes._id.required(),
    secreto: Joi.string().required()
  }),
  postsNoVisibles: Joi.object().keys({
    clipId: validacionesComunes._id.required(),
    secreto: Joi.string().required()
  })
}

/** @description Comprueba que el post existe, el clip existe, y que la llave de administración es válida
 * @param {object} opciones contiene las id y el secreto
 * @returns {array} [clip, post]
 * @throws 404 si no existe el clip, no existe el post, o no se tienen permisos
*/
const testSecretoClip = function (opciones) {
  const post = posts.findOne({
    _id: opciones.postId
  }, {
    fields: {
      clipId: 1,
      status: 1
    }
  }) || salir(404, 'Post no encontrado')

  const clip = clips.findOne({
    _id: post.clipId
  }, {
    fields: {
      secreto: 1
    }
  }) || salir(404, 'Clip no encontrado', {
    donde: 'method establecerStatus'
  })

  clip.secreto === opciones.secreto || salir(401, 'No tienes permiso para administrar el clip', {
    donde: 'method establecerStatus'
  })

  return [clip, post]
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
    const [clip, post] = testSecretoClip(opciones)
    posts.update(opciones.postId, {
      $set: {
        status: opciones.status
      }
    })
    if (post.status !== 'VISIBLE' && opciones.status === 'VISIBLE') {
      return clips.update(clip._id, {
        $inc: {
          posts: 1
        }
      })
    }
    if (post.status === 'VISIBLE' && opciones.status !== 'VISIBLE') {
      return clips.update(clip._id, {
        $inc: {
          posts: -1
        }
      })
    }
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
    schema: validacionesComunes._id
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
    _id: opciones.clipId
  }) || salir(404, 'Clip no encontrado')

  clip.secreto === opciones.secreto || salir(401, 'Clave de administración no válida')

  return posts.find({
    clipId: opciones.clipId,
    status: {
      $ne: 'VISIBLE'
    }
  })
})
