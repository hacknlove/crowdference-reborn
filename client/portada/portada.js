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

ventanas.options.notFound = function (match, v) {
  v.push({
    _id: 'portada'
  })
  return v.push({
    template: 'alerta',
    titulo: 'No entrontrado',
    contenido: 'La url que busca no se encuentra'
  })
}
