import { Template } from 'meteor/templating'
import moment from 'moment'

Template.registerHelper('fecha', function (fecha) {
  return moment(fecha).format('YYYY-MM-DD')
})
