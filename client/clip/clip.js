import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { tituloAUrl } from '/common/varios'

Template.crearClip.onRendered(function () {
  Template.hamburguesa.openWindow()
})

Template.crearClip.onRendered(function () {
  ventanas.close('portada')
  ventanas.conf('titulo',
    ventanas.conf('titulo') ||
    ventanas.conf('buscar') ||
    ''
  )
})

Template.crearClip.helpers({
  url () {
    return tituloAUrl(ventanas.conf('titulo'))
  }
})

Template.crearClip.events({
  'click .cancelar' () {
    ventanas.conf('titulo', false)
  },
  'input input' (event) {
    ventanas.conf(event.currentTarget.name, event.currentTarget.value)
  },
  'submit form' (event, template) {
    event.preventDefault()
    ventanas.wait('crearClip')
    template.$('form').validarFormulario()
    Meteor.call('crearClip', ventanas.conf('titulo'), (e, r) => {
      if (!e) {
        ventanas.close('crearClip')
        r.template = 'editarClip'
        ventanas.insert(r)
        return ventanas.conf('path', `/${tituloAUrl(ventanas.conf('titulo'))}`)
      }
      ventanas.unwait('crearClip')
      switch (e.reason) {
        case 'titulo repetido':
          return template.$('input[name=titulo]').marcarError('noValido')
        case 'url repetida':
          return template.$('input[readonly]').marcarError('noValido')
        case 'default':
          ventanas.error(e)
      }
    })
  }
})
