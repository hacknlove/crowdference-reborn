/* global db */

db.clips.find().forEach(clip => {
  db.clips.update({
    _id: clip._id
  }, {
    $set: {
      posts: db.posts.find({
        clipId: clip._id
      }).count()
    }
  })
})
