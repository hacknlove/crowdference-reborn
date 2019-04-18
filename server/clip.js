import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { clips } from '/common/baseDeDatos'
import { salirValidacion } from '/server/comun'
import { tituloAUrl } from '/common/varios'

import Joi from 'joi'

const validaciones = {
  editarClipPublish: Joi.object().keys({
    _id: Joi.string().required(),
    secret: Joi.string().required()
  })
}

Meteor.methods({
  'crearClip' (titulo) {
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

    const secret = Random.secret()
    const root = Random.secret()
    const clipId = clips.insert({
      titulo,
      url,
      secret,
      root
    })

    return {
      secret,
      root,
      clipId
    }
  }
})

Meteor.publish('editarClip', function (opciones) {
  salirValidacion({
    data: opciones,
    schema: validaciones.editarClipPublish,
    debug: {
      donde: 'publish salirValidacion'
    }
  })
  return clips.find(opciones)
})
