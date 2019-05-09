import { Template } from 'meteor/templating'
import { misClips } from '/common/baseDeDatos'

Template.registerHelper('tengoClips', function () {
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
