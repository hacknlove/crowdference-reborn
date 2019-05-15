import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion, salir } from '/server/comun'
import { tituloAUrl } from '/common/varios'

import Joi from 'joi'

const validaciones = {
  revocar: Joi.object().keys({
    clipId: Joi.string().required(),
    seguridad: Joi.string().required(),
    llave: Joi.string().valid(['seguridad', 'secreto']).required()
  }),
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
    secreto: Joi.string()
  }),
  clipIdPublish: Joi.object().keys({
    clipId: Joi.string().required(),
    secreto: Joi.string().required()
  }),
  agregarLink: Joi.object().keys({
    url: Joi.string().regex(/^[a-z-]+$/).required(),
    link: Joi.string().required(),
    OG: Joi.object().required()
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
    const clipId = clips.insert({
      creacion: new Date(),
      titulo,
      url,
      secreto,
      seguridad
    })

    return {
      clipId,
      secreto,
      seguridad
    }
  },
  agregarLink (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.agregarLink,
      debug: {
        donde: 'method agregarLink'
      }
    })
    const clip = clips.findOne({
      url: opciones.url
    }) || salir(404, 'Clip no encontrado', {
      donde: 'method agregarLink'
    })

    if (posts.findOne({
      clipId: clip._id,
      link: opciones.link
    })) {
      return
    }
    posts.insert({
      clipId: clip._id,
      OG: opciones.OG,
      link: opciones.link,
      timestamp: new Date(),
      status: 'PENDIENTE',
      prioridad: 0
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
    }).count() || salir(401, 'No tienes permiso para administrar el clip', {
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
    }).count() || salir(401, 'No tienes permiso para administrar el clip', {
      donde: 'method establecerStatus'
    })

    posts.find({
      _id: opciones.postId,
      clipId: opciones.clipId
    }).count() || salir(404, 'Post no encontrado')

    posts.remove(opciones.postId)
  },
  revocar (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.revocar,
      debug: {
        donde: 'method revocar'
      }
    })

    clips.find({
      _id: opciones.clipId
    }).count() || salir(404, 'Clip no encontrado', {
      donde: 'method revocar'
    })

    clips.find({
      _id: opciones.clipId,
      seguridad: opciones.seguridad
    }).count() || salir(400, 'No tienes permiso para revocar llaves', {
      donde: 'method revocar'
    })

    const llave = Random.secret()

    clips.update(opciones.clipId, {
      $set: {
        [opciones.llave]: llave
      }
    })
    return llave
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
    url: opciones.url
  }) || salir(404, 'Clip no encontrado', {
    donde: 'publish clip'
  })

  opciones.secreto && clip.secreto !== opciones.secreto && salir(401, 'No tienes permiso', {
    donde: 'publish clip'
  })

  const postsQuery = {
    clipId: clip._id
  }

  if (!opciones.secreto) {
    postsQuery.status = 'VISIBLE'
  }

  return [
    clips.find(clip._id, {
      fields: {
        seguridad: 0,
        secreto: 0
      }
    }),
    posts.find(postsQuery)
  ]
})
Meteor.publish('clipId', function (opciones) {
  salirValidacion({
    data: opciones,
    schema: validaciones.clipIdPublish,
    debug: {
      donde: 'publish clipId'
    }
  })

  return clips.find({
    _id: opciones.clipId,
    secreto: opciones.secreto
  }, {
    fields: {
      seguridad: 0,
      secreto: 0
    }
  })
})
