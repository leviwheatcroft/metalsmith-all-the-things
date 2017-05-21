import deploy from './lib/deploy'

// aws: {
//   bucketUrl: 'leviwheatcroft.com.s3-website-ap-southeast-2.amazonaws.com',
//   AWS_ACCESS_KEY_ID: 'AKIAIX6YAAQLV6U2SPHQ',
//   AWS_SECRET_ACCESS_KEY: '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'
// },

deploy({
  srcPath: 'build',
  destPath: '',
  bucket: 'leviwheatcroft.com',
  debugNamespace: 'metalsmith-levistat',
  cacheRoot: '.store',
  concurrency: 16
})
