import { _ } from 'meteor/underscore'
import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { tituloAUrl } from '/common/varios'
import ClipboardJS from 'clipboard'

Template.crearClip.testUrl = _.debounce(function testUrl (titulo) {
  if (!titulo) {
    return
  }
  Meteor.call('testTitulo', titulo, (e, r) => {
    if (!e) {
      return ventanas.update('crearClip', {
        $unset: {
          error: 1
        }
      })
    }
    ventanas.update('crearClip', {
      $set: {
        error: true
      }
    })
  })
}, 200)
Template.crearClip.onRendered(function () {
  ventanas.close('portada')
  ventanas.conf('titulo',
    ventanas.conf('titulo') ||
    ventanas.conf('buscar') ||
    ''
  )
  Template.crearClip.testUrl(ventanas.conf('titulo'))
})
Template.crearClip.helpers({
  url () {
    return tituloAUrl(ventanas.conf('titulo'))
  },
  oculto () {
    Template.currentData()
    if (!ventanas.conf('titulo')) {
      return 'oculto'
    }
    if (this.error) {
      return 'oculto'
    }
    return 'visible'
  },
  tituloVacio () {
    return ventanas.conf('titulo') ? '' : 'error vacio'
  },
  urlRepetida () {
    Template.currentData()
    console.log(this.error)
    return this.error ? 'error noValido' : ''
  }
})
Template.crearClip.events({
  'click .cancelar' () {
    ventanas.conf('titulo', false)
  },
  'input input' (event) {
    ventanas.conf('titulo', event.currentTarget.value)
    Template.crearClip.testUrl(event.currentTarget.value)
  },
  'submit form' (event, template) {
    event.preventDefault()
    ventanas.wait('crearClip')
    template.$('form').validarFormulario()
    Meteor.call('crearClip', ventanas.conf('titulo'), (e, r) => {
      if (!e) {
        ventanas.close('crearClip')
        r._id = 'mostrarSecreto'
        r.copiado = []
        ventanas.insert(r)
        r.copiado = [true, true]
        return ventanas.conf('path', `/?v=${ventanas.createUrl([r])}`)
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

Template.mostrarSecreto.onRendered(function () {
  this.clipboard = new ClipboardJS('input[readonly]', {
    text (element) {
      return element.value
    }
  })
  this.clipboard.on('success', (event) => {
    ventanas.insert({
      template: 'alerta',
      titulo: 'copiado',
      contenido: `${event.trigger.title} se ha copiado al portapapeles`
    })
    ventanas.update('mostrarSecreto', {
      $addToSet: {
        copiado: event.trigger.title
      }
    })
  })
})
Template.mostrarSecreto.helpers({
  oculto () {
    Template.currentData()
    return this.copiado.length === 2 ? '' : 'oculto'
  }
})
Template.mostrarSecreto.events({
  'click button' () {
    ventanas.close('mostrarSecreto')
    ventanas.insert({
      _id: 'administrarClip',
      secreto: this.secreto,
      clipId: this.clipId
    })
    return ventanas.conf('path', `/?v=${ventanas.createUrl([{
      _id: 'administrarClip',
      secreto: this.secreto,
      clipId: this.clipId
    }])}`)
  }
})
