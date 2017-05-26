import deploy from './lib/deploy'

deploy({
  srcPath: 'build',
  destPath: '',
  bucket: 'leviwheatcroft.com',
  debugNamespace: 'metalsmith-levistat',
  cacheRoot: '.store',
  concurrency: 16
})
