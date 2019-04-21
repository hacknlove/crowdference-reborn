/* global db */

db.clips.createIndex({
  url: 1
}, {
  unique: true,
  collation: {
    locale: 'es',
    strength: 1
  }
})

db.clips.createIndex({
  titulo: 'text'
})
