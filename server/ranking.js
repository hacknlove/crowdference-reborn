import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'

Meteor.publish('ranking', function (pagina) {
  return clips.find()
})

Meteor.publish('primerPost', function (clipId) {
  return posts.find({
    clipId,
    status: 'VISIBLE'
  }, {
    sort: {
      timestamp: -1
    },
    limit: 1
  })
})
