import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { clips } from '/common/baseDeDatos'
import { salirValidacion } from '/server/comun'
import { tituloAUrl } from '/common/varios'

import Joi from 'joi'

const validaciones = {
  editarClipPublish: Joi.object().keys({
    url: Joi.string().regex(/^[a-z-]+$/).required(),
    secreto: Joi.string().required()
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
  }
})

Meteor.publish('administrarClip', function (opciones) {
  salirValidacion({
    data: opciones,
    schema: validaciones.editarClipPublish,
    debug: {
      donde: 'publish salirValidacion'
    }
  })
  return clips.find({
    url: opciones.url,
    secreto: opciones.secreto
  }, {
    fields: {
      seguridad: 0
    }
  })
})
