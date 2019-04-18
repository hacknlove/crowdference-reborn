import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.hamburguesa.openWindow = function () {
  ventanas.upsert({
    _id: 'hamburguesa'
  }, {
    $set: {
      nourl: 1
    }
  })
}
