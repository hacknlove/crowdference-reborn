import { Template } from 'meteor/templating'
import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { links } from '/common/baseDeDatos'

Template.ranking.onCreated(function () {
  ventanas.conf('path', `/r`)
  this.autorun(function () {
    Meteor.subscribe('ranking')
  })
})

Template.ranking.helpers({
  links () {
    return links.find({}, {
      sort: {
        votos: -1
      }
    })
  }
})
