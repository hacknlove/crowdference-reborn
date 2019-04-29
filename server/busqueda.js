import { Meteor } from 'meteor/meteor'
import { clips } from '/common/baseDeDatos'

Meteor.publish('busqueda', function (busqueda, pagina = 0) {
  var regex = /(?:)/
  try {
    regex = new RegExp(busqueda)
  } catch (e) {
    regex = /$^/
  }
  return clips.find({
    titulo: regex,
    posts: {
      $gt: 0
    }
  }, {
    sort: {
      apoyos: -1
    },
    skip: 10 * pagina,
    limit: 10
  })
})
