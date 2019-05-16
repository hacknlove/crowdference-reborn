import { ventanas } from 'meteor/hacknlove:ventanas'
import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'
import { Template } from 'meteor/templating'

ventanas.use('/link/:link', function (match, v) {
  console.log(match)
  return v.push({
    _id: 'link',
    link: decodeURIComponent(match.link)
  })
})

Template.link.onCreated(function () {
  Meteor.subscribe('link', this.data.link)
})

Template.link.helpers({
  post () {
    return posts.findOne({
      link: this.data.link
    }, {
      fields: {
        clipId: 0
      }
    })
  },
  clips () {
    return clips.find({}, {
      sort: {
        apoyos: -1
      }
    })
  }
})
