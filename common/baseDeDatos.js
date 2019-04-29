import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const clips = new Mongo.Collection('clips')
export const posts = new Mongo.Collection('posts')

if (Meteor.isDevelopment) {
  global.clips = clips
  global.posts = posts
}
