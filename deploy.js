import deploy from './lib/deploy'

deploy({
  srcPath: 'build',
  destPath: '',
  bucket: 'metalsmith-all-the-things',
  concurrency: 2,
  clearCache: process.argv.slice(-1)[0] === '--clear-cache'
})
