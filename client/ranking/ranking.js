import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import moment from 'moment'

ventanas.use('/ranking/:pagina', function (match, v) {
  return v.push({
    _id: 'ranking',
    pagina: match.pagina
  })
})

Template.ranking.onCreated(function () {
  ventanas.conf('path', `/ranking/${this.data.pagina}`)
  this.autorun(function () {
    Meteor.subscribe('ranking', ventanas.findOne('ranking').pagina)
  })
})

Template.ranking.helpers({
  clips () {
    return clips.find({
      posts: {
        $gt: 0
      }
    }, {
      sort: {
        apoyos: -1,
        creacion: -1
      }
    })
  }
})

Template.vistaPrevia.onCreated(function () {
  Meteor.subscribe('primerPost', this.data._id)
  Meteor.call('actualizarApoyos', this.data._id)
})
Template.vistaPrevia.helpers({
  post () {
    return posts.findOne({
      clipId: this._id
    })
  }
})

Template.registerHelper('fecha', function (fecha) {
  return moment(fecha).format('YYYY-MM-DD')
})

Template.menuRanking.events({
  'click .closeRanking' () {
    ventanas.close('ranking')
  }
})
