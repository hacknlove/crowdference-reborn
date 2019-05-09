import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion, salir } from '/server/comun'
import { tituloAUrl } from '/common/varios'

import Joi from 'joi'

const validaciones = {
  establecerStatus: Joi.object().keys({
    clipId: Joi.string().required(),
    postId: Joi.string().required(),
    secreto: Joi.string().required(),
    status: Joi.string().valid(['RECHAZADO', 'OCULTO', 'VISIBLE']).required()
  }),
  eliminarPost: Joi.object().keys({
    clipId: Joi.string().required(),
    postId: Joi.string().required(),
    secreto: Joi.string().required()
  }),
  clipPublish: Joi.object().keys({
    url: Joi.string().regex(/^[a-z-]+$/).required(),
    secreto: Joi.string().required()
  }),
  agregarPost: Joi.object().keys({
    url: Joi.string().regex(/^[a-z-]+$/).required(),
    link: Joi.string().required(),
    rrss: Joi.string().valid(['facebook', 'instagram', 'twitter', 'youtube']).required(),
    secreto: Joi.string()
  }),
  titulo: Joi.string()
}

Meteor.methods({
  crearClip (titulo) {
    salirValidacion({
      data: titulo,
      schema: validaciones.titulo,
      debug: {
        donde: 'method crearClip'
      }
    })

    if (clips.find({
      titulo
    }, {
      limit: 1
    }).count()) {
      throw new Meteor.Error(400, 'titulo repetido')
    }
    const url = tituloAUrl(titulo)
    if (clips.find({
      url
    }, {
      limit: 1
    }).count()) {
      throw new Meteor.Error(400, 'url repetida')
    }

    const secreto = Random.secret()
    const seguridad = Random.secret()
    clips.insert({
      creacion: new Date(),
      titulo,
      url,
      secreto,
      seguridad
    })

    return {
      _id: 'mostrarSecreto',
      secreto,
      seguridad,
      url,
      copiado: []
    }
  },
  agregarPost (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.agregarPost,
      debug: {
        donde: 'method agregarPost'
      }
    })
    const clip = clips.findOne({
      url: opciones.url,
      secreto: opciones.secreto || {
        $exists: 1
      }
    }) || salir(404, 'Clip no encontrado', {
      donde: 'method agregarPost'
    })

    if (posts.findOne({
      clipId: clip._id,
      link: opciones.link
    })) {
      return
    }
    posts.insert({
      clipId: clip._id,
      rrss: opciones.rrss,
      link: opciones.link,
      timestamp: new Date(),
      status: opciones.secreto ? 'VISIBLE' : 'PENDIENTE'
    })
    if (opciones.secreto) {
      clips.update({
        _id: clip._id
      }, {
        $inc: {
          posts: 1
        }
      })
    }
  },
  testTitulo (titulo) {
    salirValidacion({
      data: titulo,
      schema: validaciones.titulo,
      debug: {
        donde: 'method testTitulo'
      }
    })
    // if (clips.find({
    //   titulo
    // }, {
    //   limit: 1
    // }).count()) {
    //   console.log('titulo repetido')
    //   throw new Meteor.Error(400, 'titulo repetido')
    // }
    const url = tituloAUrl(titulo)
    if (clips.find({
      url
    }, {
      limit: 1
    }).count()) {
      throw new Meteor.Error(400, 'url repetida')
    }
  },
  establecerStatus (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.establecerStatus,
      debug: {
        donde: 'method establecerStatus'
      }
    })

    clips.find({
      _id: opciones.clipId
    }).count() || salir(404, 'Clip no encontrado', {
      donde: 'method establecerStatus'
    })

    clips.find({
      _id: opciones.clipId,
      secreto: opciones.secreto
    }).count() || salir(400, 'No tienes permiso para administrar el clip', {
      donde: 'method establecerStatus'
    })

    posts.find({
      _id: opciones.postId,
      clipId: opciones.clipId
    }).count() || salir(404, 'Post no encontrado')

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

    clips.find({
      _id: opciones.clipId
    }).count() || salir(404, 'Clip no encontrado', {
      donde: 'method establecerStatus'
    })

    clips.find({
      _id: opciones.clipId,
      secreto: opciones.secreto
    }).count() || salir(400, 'No tienes permiso para administrar el clip', {
      donde: 'method establecerStatus'
    })

    posts.find({
      _id: opciones.postId,
      clipId: opciones.clipId
    }).count() || salir(404, 'Post no encontrado')

    posts.remove(opciones.postId)
  }
})

Meteor.publish('clip', function (opciones) {
  salirValidacion({
    data: opciones,
    schema: validaciones.clipPublish,
    debug: {
      donde: 'publish clip'
    }
  })
  const clip = clips.findOne({
    url: opciones.url,
    secreto: opciones.secreto || {
      $exists: 1
    }
  }) || salir(404, 'Clip no encontrado', {
    donde: 'method agregarPost'
  })
  return [
    clips.find(clip._id, {
      fields: {
        seguridad: 0,
        secreto: 0
      }
    }),
    posts.find({
      clipId: clip._id,
      status: opciones.secreto ? {
        $exists: 1
      } : 'VISIBLE'
    })
  ]
})
