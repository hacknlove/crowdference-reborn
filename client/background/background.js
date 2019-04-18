import { Meteor } from 'meteor/meteor'
import { $ } from 'meteor/jquery'

const q = 12
Meteor.startup(function () {
  var fondo = Math.floor(Math.random() * q)
  $('body>.background').css('background-image', `url(/static/fondos/${fondo}.jpg)`)
  setInterval(function () {
    const background = $('body>.background').not('#pausa')
    const copy = background.clone()
    for (var f = fondo; f === fondo; f = Math.floor(Math.random() * q)) {}
    fondo = f
    copy.css('background-image', `url(/static/fondos/${fondo}.jpg)`)
    background.before(copy)
    setTimeout(function () {
      background.remove()
    }, 4000)
  }, 60000)
})
