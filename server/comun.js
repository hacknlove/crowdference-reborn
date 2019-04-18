import { Meteor } from 'meteor/meteor'
import Joi from 'joi'

export const salir = function salir (codigo, mensaje, debug) {
  if (debug) {
    console.log(codigo, mensaje)
    console.log(JSON.stringify(debug, null, 2))
  }
  throw new Meteor.Error(codigo, mensaje)
}

export const salirValidacion = function (opciones) {
  const validacion = Joi.validate(opciones.data, opciones.schema)
  if (!validacion.error) {
    return
  }
  opciones = Object.assign({
    codigo: 400,
    mensaje: validacion.error.details[0].message
  }, opciones)
  if (opciones.debug) {
    opciones.debug.details = validacion.error.details
    opciones.debug._object = validacion.error._object
  }
  salir(opciones.codigo, opciones.mensaje, opciones.debug)
}
