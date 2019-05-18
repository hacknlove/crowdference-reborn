import { ventanas } from 'meteor/hacknlove:ventanas'
import { Template } from 'meteor/templating'
import moment from 'moment'

ventanas.use('/', function (match, v) {
  return v.length || v.push({
    _id: 'portada'
  })
})
ventanas.use('/f', function (match, v) {
  return v.push({
    _id: 'favoritos'
  })
})
ventanas.use('/s/:busqueda', function (match, v) {
  return v.push({
    _id: 'busqueda',
    busqueda: decodeURIComponent(match.busqueda)
  })
})
ventanas.use('/r', function (match, v) {
  return v.push({
    _id: 'ranking',
    pagina: match.pagina
  })
})
ventanas.use('/c/:url', function (match, v) {
  return v.push({
    _id: 'verClip',
    url: match.url
  })
})
ventanas.use('/k/:clipId/:secreto', function (match, v) {
  return v.push({
    _id: 'llaves',
    clipId: match.clipId,
    secreto: match.secreto
  })
})
ventanas.use('/k/:clipId/:secreto/:seguridad', function (match, v) {
  return v.push({
    _id: 'llaves',
    clipId: match.clipId,
    seguridad: match.seguridad,
    secreto: match.secreto
  })
})
ventanas.use('/l/:link', function (match, v) {
  return v.push({
    _id: 'link',
    link: decodeURIComponent(match.link)
  })
})
ventanas.use('/c/:url', function (match, v) {
  return v.push({
    _id: 'verClip',
    url: match.url
  })
})

Template.registerHelper('fecha', function (fecha) {
  return moment(fecha).format('YYYY-MM-DD')
})
