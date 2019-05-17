import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const clips = new Mongo.Collection('clips')
export const posts = new Mongo.Collection('posts')
export const links = new Mongo.Collection('links')

export var localLinks
export var favoritos

if (Meteor.isClient) {
  favoritos = new Mongo.Collection(null)
  /* eslint-disable-next-line */
  new PersistentMinimongo2(favoritos, 'favoritos')

  localLinks = new Mongo.Collection(null)
  /* eslint-disable-next-line */
  new PersistentMinimongo2(localLinks, 'localLinks')
}

if (Meteor.isDevelopment) {
  global.favoritos = favoritos
  global.clips = clips
  global.posts = posts
  global.links = links
  global.localLinks = localLinks
}
