import { ventanas } from 'meteor/hacknlove:ventanas'
import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'

Template.portada.events({
  'input input' (event) {
    ventanas.conf('buscar', event.currentTarget.value)
  }
})
Template.portada.helpers({
  oculto () {
    return ventanas.conf('buscar') ? 'visible' : 'oculto'
  }
})

Tracker.autorun(function () {
  if (ventanas.findOne('portada')) {
    return
  }
  if (ventanas.find({
    _id: {
      $nin: ['c', 'hamburguesa']
    }
  }).count()) {
    return
  }
  ventanas.insert({
    _id: 'portada',
    nourl: 1
  })
  ventanas.close('hamburguesa')
})
