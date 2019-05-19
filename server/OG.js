import { ventanas } from 'meteor/hacknlove:ventanas'
// import { Meteor } from 'meteor/meteor'
// import { clips, links } from '/common/baseDeDatos'

const OG = function (sink, datos, ventanas) {
  sink.appendToHead(`
  <meta property="og:title" content="${datos.title}"/>
  <meta property="og:description" content="${datos.description}"/>
  <meta property="og:image" itemprop="image" content="${process.env.ROOT_URL}${datos.image}"/>
  <meta property="og:image:secure_url" itemprop="image" content="${datos.image}"/>
  <meta property="og:site_name" content="crowdference-reborn"/>
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
    title: 'crowdference-reborn',
    description: 'Organize internet to fight fakenews and missinformation',
    image: `${process.env.ROOT_URL}/logoletras.png`
  }, [
    {
      _id: 'portada'
    }
  ])
})
ventanas.use('/f', function (sink, match, v) {
  OG(sink, {
    title: 'Your favorite clips',
    description: 'Here you keep your favorite clips',
    image: `${process.env.ROOT_URL}/logoletras.png`
  }, [
    {
      _id: 'favoritos'
    }
  ])
})
ventanas.use('/s/:busqueda', function (sink, match, v) {
  OG(sink, {
    title: '',
    description: '',
    image: '',
    update: ''
  }, [
    {
      _id: 'busqueda',
      busqueda: decodeURIComponent(match.busqueda)
    }
  ])
})
ventanas.use('/r', function (sink, match, v) {
  OG(sink, {
    title: '',
    description: '',
    image: '',
    update: ''
  }, [
    {
      _id: 'ranking',
      pagina: match.pagina
    }
  ])
})
ventanas.use('/c/:url', function (sink, match, v) {
  OG(sink, {
    title: '',
    description: '',
    image: '',
    update: ''
  }, [
    {
      _id: 'verClip',
      url: match.url
    }
  ])
})
ventanas.use('/k/:clipId/:secreto', function (sink, match, v) {
  OG(sink, {
    title: '',
    description: '',
    image: '',
    update: ''
  }, [
    {
      _id: 'llaves',
      clipId: match.clipId,
      secreto: match.secreto
    }
  ])
})
ventanas.use('/k/:clipId/:secreto/:seguridad', function (sink, match, v) {
  OG(sink, {
    title: '',
    description: '',
    image: '',
    update: ''
  }, [
    {
      _id: 'llaves',
      clipId: match.clipId,
      seguridad: match.seguridad,
      secreto: match.secreto
    }
  ])
})
ventanas.use('/l/:link', function (sink, match, v) {
  OG(sink, {
    title: '',
    description: '',
    image: '',
    update: ''
  }, [
    {
      _id: 'link',
      link: decodeURIComponent(match.link)
    }
  ])
})
ventanas.use('/c/:url', function (sink, match, v) {
  OG(sink, {
    title: '',
    description: '',
    image: '',
    update: ''
  }, [
    {
      _id: 'verClip',
      url: match.url
    }
  ])
})

ventanas.use(/(?:)/, function (sink) {
  OG(sink, {
    title: 'Not found',
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
