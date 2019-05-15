import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.hamburguesa.openWindow = function (menu, closeOther) {
  ventanas.upsert({
    _id: 'hamburguesa'
  }, {
    $set: {
      nourl: 1,
      menu,
      closeOther
    }
  })
}

Template.menu.helpers({
  activo (_id) {
    return ventanas.find(_id, {
      limit: 1
    }).count()
  }
})
