var Papa = require('papaparse')
var fs = require('fs')

var csv = Papa.parse(fs.readFileSync('traducciones.csv', 'utf8'))

var resultado = {}
var listaIdiomas = {}

var idiomas = csv.data.shift(0)

idiomas.shift()
idiomas.forEach(function (e) {
  listaIdiomas[e] = 1
})

csv.data.forEach(function (traduccion) {
  if (!traduccion) {
    return
  }
  var clave = traduccion.shift()
  if (!clave) {
    return
  }
  resultado[clave] = {}
  traduccion.forEach(function (texto, i) {
    resultado[clave][idiomas[i]] = texto
  })
})

fs.writeFileSync('../common/traducciones.js', `

export const traducciones = ${JSON.stringify(resultado, null, 2)}

export const idiomas = ${JSON.stringify(listaIdiomas, null, 2)}

`)
