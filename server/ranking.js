import { Meteor } from 'meteor/meteor'
import { clips, posts } from '/common/baseDeDatos'

Meteor.publish('ranking', function (pagina = 0) {
  return clips.find({}, {
    sort: {
      apoyos: -1
    },
    skip: 10 * pagina,
    limit: 10
  })
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
