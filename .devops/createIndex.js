/* global db */

db.links.createIndex({
  title: 'text',
  description: 'text',
  url: 'text'
})

db.posts.createIndex({
  padreId: 1,
})
db.posts.createIndex({
  hijoId: 1
})
db.posts.createIndex({
  votos: 1
})

db.links.createIndex({
  url: 1
})
db.links.createIndex({
  votos: 1
})
