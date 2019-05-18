/* global localStorage */

import { Template } from 'meteor/templating'
import { traducciones } from '/common/traducciones'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'

Meteor.startup(function () {
  var lang = window.location.search.match(/lang=(..)/)
  lang = lang && lang[1]
  lang = lang || ventanas.conf('lang') || localStorage.lang || 'en'
  localStorage.lang = lang
  ventanas.conf('lang', lang)
})

export const traducir = function (key) {
  if (!traducciones[key]) {
    return key
  }
  return traducciones[key][ventanas.conf('lang')] || key
}

export const traducirConVariables = function (key, ...variables) {
  var t = traducir(key)
  var i = 1
  while (variables[i]) {
    t = t.replace(new RegExp(`\\$${i}`, 'g'), variables[i - 1])
    i++
  }
  return t
}

Template.registerHelper('_', traducir)
Template.registerHelper('__', traducirConVariables)
