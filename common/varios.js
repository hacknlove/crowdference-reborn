const diacriticas = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ñ: 'n',
  ç: 'c'
}

export const tituloAUrl = function tituloAUrl (titulo) {
  return (titulo || '').toLowerCase().replace(/[ ]/g, '-').replace(/[áéíúóüñ]/g, function (letra) {
    return diacriticas[letra]
  }).replace(/[^a-z0-9 _.-]/g, '')
}
