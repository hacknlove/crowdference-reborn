import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { clips } from '/common/baseDeDatos'
import { salirValidacion, salir } from '/server/comun'
import { tituloAUrl } from '/common/varios'

import Joi from 'joi'

const validaciones = {
  revocar: Joi.object().keys({
    clipId: Joi.string().required(),
    seguridad: Joi.string().required(),
    llave: Joi.string().valid(['seguridad', 'secreto']).required()
  }),
  obtenerSecreto: Joi.object().keys({
    clipId: Joi.string().required(),
    seguridad: Joi.string().required()
  }),
  string: Joi.string().regex(/^[a-z-]+$/).required(),
  clipIdPublish: Joi.object().keys({
    clipId: Joi.string().required(),
    secreto: Joi.string().required()
  }),
  titulo: Joi.string()
}

Meteor.methods({
  crearClip (titulo) {
    salirValidacion({
      data: titulo,
      schema: validaciones.titulo
    })

    const url = tituloAUrl(titulo)
    clips.find({
      url
    }, {
      limit: 1
    }).count() && salir(400, 'url repetida')

    const secreto = Random.secret()
    const seguridad = Random.secret()
    const clipId = clips.insert({
      creacion: new Date(),
      titulo,
      url,
      secreto,
      seguridad,
      apoyos: 0,
      links: 0
    })

    return {
      clipId,
      secreto,
      seguridad
    }
  },
  testTitulo (titulo) {
    salirValidacion({
      data: titulo,
      schema: validaciones.titulo
    })
    if (clips.find({
      titulo
    }, {
      limit: 1
    }).count()) {
      console.log('titulo repetido')
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
    schema: validaciones.string
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
    schema: validaciones.string
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
