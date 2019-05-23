import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { links } from '/common/baseDeDatos'

Template.busqueda.onCreated(function () {
  this.autorun(function () {
    const data = Template.currentData()
    console.log(data.busqueda)
    console.log(encodeURIComponent(data.busqueda))
    Meteor.subscribe('busqueda', data.busqueda)
    ventanas.conf('path', `/s/${encodeURIComponent(data.busqueda)}`)
  })
})

Template.busqueda.helpers({
  links () {
    return links.find({}, {
      sort: {
        votos: -1
      }
    })
  }
})

Template.busquedaCabecero.events({
  'click form.buscar i' (event, template) {
    template.$('form').submit()
  },
  'submit form.buscar' (event, template) {
    event.preventDefault()
    const busqueda = template.$('form.buscar>input').val().trim()
    if (!busqueda) {
      return
    }

    if (!busqueda.match(/^http(s?):\/\/[-0-9a-z.]+\.[-0-9a-z.]/i)) {
      if (this.closeOther === 'busqueda') {
        ventanas.update('busqueda', {
          $set: {
            busqueda: busqueda
          }
        })
      } else {
        ventanas.close(this.closeOther)
        ventanas.insert({
          _id: 'busqueda',
          busqueda: busqueda
        })
      }
      return
    }
    ventanas.close(this.closeOther)

    Meteor.call('link', busqueda, (e, r) => {
      if (e) {
        return ventanas.error(e)
      }
      ventanas.insert({
        _id: 'link',
        link: r
      })
    })
  }
})
