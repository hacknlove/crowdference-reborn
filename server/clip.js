import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { clips, posts } from '/common/baseDeDatos'
import { salirValidacion, salir } from '/server/comun'
import { tituloAUrl } from '/common/varios'

import Joi from 'joi'

const validaciones = {
  clipPublish: Joi.object().keys({
    url: Joi.string().regex(/^[a-z-]+$/).required(),
    secreto: Joi.string()
  }),
  agregarPost: Joi.object().keys({
    url: Joi.string().regex(/^[a-z-]+$/).required(),
    link: Joi.string(),
    rrss: Joi.string().valid(['facebook', 'instagram', 'twitter', 'youtube']),
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
