import { ventanas } from 'meteor/hacknlove:ventanas'
import { posts, links } from '/common/baseDeDatos'
import { insertar, actualizar } from '/server/link'

const OG = function (sink, datos, ventanas) {
  sink.appendToHead(`
  <meta property="og:title" content="${datos.title}"/>
  <meta property="og:description" content="${datos.description}"/>
  <meta property="og:image" itemprop="image" content="${datos.image}"/>
  <meta property="og:image:secure_url" itemprop="image" content="${datos.image}"/>
  <meta property="og:site_name" content="crowdference-reborn"/>
  <meta property="og:type" content="website"/>
  ${datos.url ? `<meta property="og:url" content="${datos.url}"/>` : ''}
  ${datos.update ? `<meta property="og:updated_time" content="${datos.update}" />` : ''}
  `)
  if (ventanas) {
    sink.appendToHead(`
    <script type="text/javascript">
    __ventanas = ${JSON.stringify(ventanas)}
    </script>
    `)
  }
}

ventanas.use('/', function (sink, match, v) {
  OG(sink, {
    title: 'Crowdference',
    description: 'Organize the society of mess-information',
    image: `${process.env.ROOT_URL}logoletras.png`,
    url: process.env.ROOT_URL
  }, [
    {
      _id: 'portada'
    }
  ])
})
ventanas.use('/f', function (sink, match, v) {
  OG(sink, {
    title: 'Crowdference - favorites',
    description: 'Here you keep your favorite links',
    image: `${process.env.ROOT_URL}logoletras.png`,
    url: `${process.env.ROOT_URL}f`
  }, [
    {
      _id: 'favoritos'
    }
  ])
})
ventanas.use('/s/:busqueda', function (sink, match, v) {
  OG(sink, {
    title: 'Crowdference - Search',
    description: `search "decodeURIComponent(match.busqueda)" in link`,
    image: `${process.env.ROOT_URL}logoletras.png`,
    url: `${process.env.ROOT_URL}s/${match.busqueda}`
  }, [
    {
      _id: 'busqueda',
      busqueda: decodeURIComponent(match.busqueda)
    }
  ])
})
ventanas.use('/r', function (sink, match, v) {
  OG(sink, {
    title: 'Crowdference - Ranking',
    description: 'See the most upvoted links',
    image: `${process.env.ROOT_URL}/logoletras.png`,
    url: `${process.env.ROOT_URL}r`
  }, [
    {
      _id: 'ranking'
    }
  ])
})
ventanas.use('/l/:link', function (sink, match, v) {
  const url = decodeURIComponent(match.link)
  var link = links.findOne({
    url
  })
  if (!link) {
    link = insertar(actualizar(url))
  }

  const count = posts.find({
    padreId: link._id
  }).count()

  OG(sink, {
    title: `Crowdference - view link`,
    description: `There are ${count} links clipped to ${url}`,
    image: link.image,
    url: `${process.env.ROOT_URL}l/${link.url[0]}`
  }, [
    {
      _id: 'link',
      link
    }
  ])
})

ventanas.useRegex(/(?:)/, [], function (sink) {
  OG(sink, {
    title: 'Crowdference - Not found',
    description: 'Check the url and try again',
    image: `${process.env.ROOT_URL}/logoletras.png`
  }, [
    {
      _id: 'portada'
    },
    {
      template: 'alerta',
      titulo: 'Not found',
      clase: 'error',
      contenido: 'Check the url and try again'
    }
  ])
})
