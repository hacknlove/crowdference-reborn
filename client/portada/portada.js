import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'

Template.portada.onCreated(function () {
  ventanas.conf('path', '/')
})
Template.portada.onDestroyed(function () {
  ventanas.close('menuPortada')
})
Template.portada.events({
  'input input' (event) {
    ventanas.conf('buscar', event.currentTarget.value)
  },
  'submit form' (event) {
    event.preventDefault()
    ventanas.close('portada')
    ventanas.insert({
      _id: 'busqueda',
      busqueda: ventanas.conf('buscar')
    })
  }
})
Template.portada.helpers({
  oculto () {
    return ventanas.conf('buscar') ? 'visible' : 'oculto'
  }
})
