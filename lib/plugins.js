import cloudinary from 'metalsmith-cloudinary'
import collections from 'metalsmith-collections'
import drafts from 'metalsmith-drafts'
import drive from 'metalsmith-google-drive'
import layouts from 'metalsmith-layouts'
import markdown from 'metalsmith-markdown'
import move from 'metalsmith-move'
import tags from 'metalsmith-tags'
import webpack from 'metalsmith-webpack'

import config from 'config'
import marked from 'marked'
import handlebarsCloudinary from 'handlebars-cloudinary'
import markedCloudinary from 'marked-cloudinary'
import Handlebars from 'handlebars'

// render images in markdown with cloudinary args.
const renderer = new marked.Renderer()
renderer.image = markedCloudinary(config.get('metalsmith-cloudinary').cloud_name)

// cloudinary helper for handlebars
Handlebars.registerHelper(
  'cloudinary',
  handlebarsCloudinary(config.get('metalsmith-cloudinary').cloud_name)
)

const plugins = [
  webpack(
    'webpack.config.js',
    [
      'js/**',
      'styles/**'
    ]
  ),

  // this weird ternary structure is just to allow disabling from config.
  // you can just call drive and cloudinary as ordinary plugins
  config.get('metalsmith-google-drive').enabled
  ? drive({
    auth: config.get('metalsmith-google-drive'),
    src: config.get('images-drive-folder'),
    dest: 'images/articles'
    // invalidateCache: true
  }) : false,

  config.get('metalsmith-cloudinary').enabled
  ? cloudinary(
    Object.assign(
      {},
      config.get('metalsmith-cloudinary'),
      {
        push: 'images/**',
        invalidateCache: false
      }
    )
  ) : false,

  config.get('metalsmith-google-drive').enabled
  ? drive({
    auth: config.get('metalsmith-google-drive'),
    src: config.get('articles-drive-folder'),
    dest: 'articles',
    invalidateCache: false
  }) : false,

  drafts(),

  markdown({ renderer, breaks: true }),

  move({
    '**/*.html': '{dir}/{name}'
  }),

  tags({
    path: 'tags/:tag',
    layout: 'cleanBlogTag.hbs'
  }),

  collections({
    articles: {
      pattern: [ 'articles/*' ],
      sortBy: 'modifiedDate',
      reverse: true
    }
  }),

  layouts({
    engine: 'handlebars',
    directory: 'layouts',
    partials: 'layouts/cleanBlog',
    pattern: [
      'index',
      'articles/*'
    ]
  })

].filter((e) => e) // remove disabled plugins

export default plugins
