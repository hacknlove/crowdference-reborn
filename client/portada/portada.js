import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'

Template.portada.onCreated(function () {
  ventanas.conf('path', '/')
})
Template.portada.onDestroyed(function () {
  ventanas.close('menuPortada')
})
Template.portada.events({
  'click .buscar' (event, template) {
    template.$('form').submit()
  },
  'submit form' (event, template) {
    event.preventDefault()
    const link = template.$('input').val().trim()
    if (!link) {
      return
    }

    if (!link.match(/^http(s?):\/\/[-0-9a-z.]+\.[-0-9a-z.]/i)) {
      return
    }

    ventanas.close('portada')
    ventanas.insert({
      _id: 'link',
      link
    })
  }
})
