import { Meteor } from 'meteor/meteor'
import { links, posts, votos } from '/common/baseDeDatos'
import { salirValidacion, salir, validacionesComunes } from '/server/comun'

import Joi from 'joi'

const validaciones = {
  agregarPost: Joi.object().keys({
    padreId: validacionesComunes._id.required(),
    hijoId: validacionesComunes._id.required(),
    fingerprint: validacionesComunes.texto.required()
  }),
  votarPost: Joi.object().keys({
    postId: validacionesComunes._id.required(),
    fingerprint: validacionesComunes.texto.required()
  }),
  posts: validacionesComunes._id
}

Meteor.methods({
  agregarPost (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.agregarPost
    })
    links.find({
      _id: opciones.padreId
    }).count() || salir(404, 'Clip no encontrado')

    var post = posts.findOne({
      padreId: opciones.padreId,
      hijoId: opciones.hijoId
    }, {
      fields: {
        votos: 1
      }
    })

    if (!post) {
      post = posts.insert({
        padreId: opciones.padreId,
        hijoId: opciones.hijoId,
        votos: 1
      })
      votos.insert({
        objeto: post._id,
        fingerprint: opciones.fingerprint
      })
      return
    }

    if (votos.findOne({
      objeto: post._id
    })) {
      return
    }
    votos.insert({
      object: post._id,
      fingerprint: opciones.fingerprint
    })
    posts.update(post._id, {
      $inc: {
        votos: 1
      }
    })
    if (votos.findOne({
      objeto: opciones.hijoId,
      fingerprint: opciones.fingerprint
    })) {
      return
    }
    votos.insert({
      objeto: opciones.hijoId,
      fingerprint: opciones.fingerprint
    })
    links.update(opciones.hijoId, {
      $inc: {
        votos: 1
      }
    })
  },
  votarPost (opciones) {
    salirValidacion({
      data: opciones,
      schema: validaciones.agregarPost
    })
    if (votos.findOne({
      objeto: opciones.postId,
      fingerprint: opciones.fingerprint
    })) {
      return
    }

    var post = posts.findOne(opciones.postId, {
      fields: {
        hijoId: 1
      }
    }) || salir(404, 'No encontrado')

    votos.insert({
      object: post._id,
      fingerprint: opciones.fingerprint
    })
    posts.update(post._id, {
      $inc: {
        votos: 1
      }
    })
    if (votos.findOne({
      objeto: post.hijoId,
      fingerprint: opciones.fingerprint
    })) {
      return
    }
    votos.insert({
      objeto: post.hijoId,
      fingerprint: opciones.fingerprint
    })
    links.update(post.hijoId, {
      $inc: {
        votos: 1
      }
    })
  }
})

Meteor.publish('posts', function (padreId) {
  salirValidacion({
    data: padreId,
    schema: validaciones.posts
  })

  return posts.find({
    padreId
  }, {
    sort: {
      votos: -1
    },
    limit: 100
  })
})
