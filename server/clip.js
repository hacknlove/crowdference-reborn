import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion, salir, validacionesComunes } from '/server/comun'
import { tituloAUrl } from '/common/varios'

import Joi from 'joi'

const validaciones = {
  revocar: Joi.object().keys({
    clipId: validacionesComunes._id.required(),
    seguridad: validacionesComunes.texto.required(),
    llave: validacionesComunes.texto.valid(['seguridad', 'secreto']).required()
  }),
  obtenerSecreto: Joi.object().keys({
    clipId: validacionesComunes._id.required(),
    seguridad: validacionesComunes.texto.required()
  }),
  url: Joi.string().regex(/^[a-z-]+$/).required(),
  clipIdPublish: Joi.object().keys({
    clipId: validacionesComunes._id.required(),
    secreto: validacionesComunes.texto.required()
  }),
  crearClip: Joi.object().keys({
    titulo: validacionesComunes.texto.required(),
    linkId: validacionesComunes._id
  })
}

Meteor.methods({
  clipIdToUrl (_id) {
    salirValidacion({
      data: _id,
      schema: validacionesComunes._id
    })
    const clip = clips.findOne(_id, {
      fields: {
        url: 1
      }
    }) || salir(404, 'Clip no encontrado')
    return clip.url
  },
  crearClip (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.crearClip
    })

    const url = tituloAUrl(opciones.titulo)
    clips.find({
      url
    }, {
      limit: 1
    }).count() && salir(400, 'url repetida')

    const secreto = Random.secret()
    const seguridad = Random.secret()
    const clipId = clips.insert({
      actualizacion: new Date(),
      titulo: opciones.titulo,
      url,
      secreto,
      seguridad,
      posts: 0
    })

    if (opciones.linkId) {
      posts.insert({
        clipId,
        timestamp: new Date(),
        linkId: opciones.linkId,
        status: 'OCULTO'
      })
    }
    return {
      clipId,
      secreto,
      seguridad
    }
  },
  testTitulo (titulo) {
    salirValidacion({
      data: titulo,
      schema: validacionesComunes.texto
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
    }).count() || salir(404, 'Clip no encontrado')

    clips.find({
      _id: opciones.clipId,
      seguridad: opciones.seguridad
    }).count() || salir(400, 'No tienes permiso para revocar llaves')

    const llave = Random.secret()

    clips.update(opciones.clipId, {
      $set: {
        [opciones.llave]: llave
      }
    })
    return llave
  },
  obtenerSecreto (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.obtenerSecreto
    })

    clips.find({
      _id: opciones.clipId
    }).count() || salir(404, 'Clip no encontrado')

    const clip = clips.findOne({
      _id: opciones.clipId,
      seguridad: opciones.seguridad
    }) || salir(401, 'No tienes permiso para obtener la llave de administración')

    return clip.secreto
  }
})

Meteor.publish('clipUrl', function (url) {
  salirValidacion({
    data: url,
    schema: validaciones.url
  })

  return clips.find({
    url
  }, {
    fields: {
      seguridad: 0,
      secreto: 0
    }
  })
})
Meteor.publish('clipId', function (_id) {
  salirValidacion({
    data: _id,
    schema: validacionesComunes._id
  })

  return clips.find({
    _id
  }, {
    fields: {
      seguridad: 0,
      secreto: 0
    }
  })
})
