import Metalsmith from 'metalsmith'
import debug from 'debug'
import plugins from './lib/plugins'
import config from 'config'
import http from 'http'

const dbg = debug(`metalsmith-${config.get('debugNamespace')}`)

let metalsmith = Metalsmith(__dirname)

metalsmith.metadata(config.get('meta'))
metalsmith.plugins = plugins

metalsmith.build((err, files) => {
  if (err) return dbg(err)
  // trigger reload
  http.get('http://localhost:3000/__browser_sync__?method=reload')
  .on('error', () => dbg('browserSync not listening?'))
})
