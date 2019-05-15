import { Template } from 'meteor/templating'
import { misClips } from '/common/baseDeDatos'
import { ventanas } from 'meteor/hacknlove:ventanas'

Template.registerHelper('tengoClips', function () {
  if (ventanas.findOne('misClips')) {
    return
  }
  return misClips.find().count()
})

Template.registerHelper('secreto', function (id) {
  console.log((misClips.findOne({
    $or: [
      {
        _id: id
      },
      {
        url: id
      }
    ]
  }) || {}).secreto)
  return (misClips.findOne({
    $or: [
      {
        _id: id
      },
      {
        url: id
      }
    ]
  }) || {}).secreto
})
Template.registerHelper('miClip', function (id) {
  return misClips.findOne({
    $or: [
      {
        _id: id
      },
      {
        url: id
      }
    ]
  })
})
