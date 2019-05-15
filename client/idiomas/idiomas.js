/* global localStorage */
import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { idiomas } from '/common/traducciones'
import { traducir } from '/client/traduccion'

Template.menuIdiomas.helpers({
  languages: Object.keys(idiomas),
  idiomaActivo (idioma) {
    const l = ventanas.conf('lang')
    if (!idiomas[l] && idioma === 'es') {
      return 'activo'
    }
    return idioma === l && 'activo'
  }
})

Template.menuIdiomas.events({
  'click .menu>div:not(.activo)' (event) {
    localStorage.lang = event.currentTarget.dataset.lang
    ventanas.conf('lang', event.currentTarget.dataset.lang)
  }
})
