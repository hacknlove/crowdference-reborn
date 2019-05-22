import { ventanas } from 'meteor/hacknlove:ventanas'
import { clips, posts, links } from '/common/baseDeDatos'

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
    description: 'Here you keep your favorite clips',
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
    description: `search "decodeURIComponent(match.busqueda)" in the clip's titles`,
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
    title: 'Crowdference - Recent',
    description: 'See the last updated clips',
    image: `${process.env.ROOT_URL}/logoletras.png`,
    url: `${process.env.ROOT_URL}r`
  }, [
    {
      _id: 'recents'
    }
  ])
})
ventanas.use('/c/:url', function (sink, match, v) {
  const clip = clips.findOne({
    url: match.url
  })
  const post = posts.findOne({
    clipId: clip._id
  }, {
    sort: {
      timestamp: -1
    }
  })
  const link = links.findOne(post.linkId)
  OG(sink, {
    title: 'Crowdference - Clip',
    description: `The clip titled "${clip.titulo}" contains ${clip.posts} link(s)`,
    image: link.image,
    update: clip.actualizacion,
    url: `${process.env.ROOT_URL}c/${match.url}`
  }, [
    {
      _id: 'verClip',
      url: match.url
    }
  ])
})
ventanas.use('/k/:clipId/:secreto', function (sink, match, v) {
  const clip = clips.findOne({
    url: match.url
  })
  const post = posts.findOne(clip._id, {
    sort: {
      timestamp: -1
    }
  })
  const link = links.findOne(post.linkId)

  OG(sink, {
    title: 'Crowdferece - Admin key',
    description: `This key allows you to moderate the clip titled "${clip.title}"`,
    image: link.image,
    update: clip.actualizacion,
    url: `${process.env.ROOT_URL}k/${match.clip}/${match.secreto}`
  }, [
    {
      _id: 'llaves',
      clipId: match.clipId,
      secreto: match.secreto
    }
  ])
})
ventanas.use('/k/:clipId/:secreto/:seguridad', function (sink, match, v) {
  const clip = clips.findOne({
    url: match.url
  })
  const post = posts.findOne(clip._id, {
    sort: {
      timestamp: -1
    }
  })
  const link = links.findOne(post.linkId)

  OG(sink, {
    title: 'Crowdference - Safe key',
    description: `This key allows you to revoke the administration key of the clip titled "${clip.title}"`,
    image: link.image,
    update: clip.actualizacion,
    url: `${process.env.ROOT_URL}k/${match.clip}/${match.secreto}/${match.seguridad}`
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
  const url = decodeURIComponent(match.link)
  const link = links.findOne({
    url
  })

  OG(sink, {
    title: `Crowdference - explore link`,
    description: `See the clips that contains the link ${url}`,
    image: link.image,
    url: `${process.env.ROOT_URL}l/${link[url][0]}`
  }, [
    {
      _id: 'link',
      link: decodeURIComponent(match.link)
    }
  ])
})

ventanas.use('/m', function (sink) {
  OG(sink, {
    title: 'Crowdference - Create clip',
    description: 'Here you can create a new clip',
    image: `${process.env.ROOT_URL}logoletras.png`,
    url: `${process.env.ROOT_URL}f`
  }, [
    {
      _id: 'crearClip'
    }
  ])
})

ventanas.use(/(?:)/, function (sink) {
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
