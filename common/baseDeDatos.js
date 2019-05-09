import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const clips = new Mongo.Collection('clips')
export const posts = new Mongo.Collection('posts')
export var misClips

if (Meteor.isClient) {
  misClips = new Mongo.Collection(null)
  /* eslint-disable-next-line */
  new PersistentMinimongo2(misClips, 'misClips')
}

if (Meteor.isDevelopment) {
  global.misClips = misClips
  global.clips = clips
  global.posts = posts
}
