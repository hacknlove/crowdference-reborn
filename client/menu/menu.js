import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.hamburguesa.openWindow = function (menu) {
  ventanas.upsert({
    _id: 'hamburguesa'
  }, {
    $set: {
      nourl: 1,
      menu
    }
  })
}
