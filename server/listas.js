import { Meteor } from 'meteor/meteor'
import { links } from '/common/baseDeDatos'
import { salirValidacion, validacionesComunes } from '/server/comun'

Meteor.publish('ranking', function () {
  return links.find({
  }, {
    sort: {
      votos: -1
    },
    limit: 100
  })
})

Meteor.publish('busqueda', function (busqueda) {
  salirValidacion({
    data: busqueda,
    schema: validacionesComunes.texto
  })
  return links.find({
    $text: {
      $search: busqueda
    }
  }, {
    fields: {
      score: { $meta: 'textScore' }
    },
    sort: { score: { $meta: 'textScore' } },
    limit: 100
  })
})
