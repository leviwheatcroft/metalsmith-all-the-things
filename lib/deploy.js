/**
 * ## Deploy to S3
 * concurrent uploads to S3 are problematic. If you spool 16 concurrent uploads
 * they all seem to resolve at the same time. No idea why but I suspect it's
 * to do with the md5 hash that S3 does on receipt. Anyhow, nothing we can do
 * about it.
 */
import debug from 'debug'
import config from 'config'
import mmm from 'mmmagic'
import AWS from 'aws-sdk'
import {
  join,
  resolve,
  parse
} from 'path'
import readdir from 'readdir-enhanced'
import {
  // createReadStream as readStream,
  readFile
} from 'fs'
import md5 from 'md5'
import {
  ValueCache
} from 'metalsmith-cache'
import vow from 'vow'
import mime from 'mime-types'

const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)
const valueCache = new ValueCache('deploy-hashes')
const dbg = debug(config.get('debugNamespace'))

export default function sync (options) {
  options = Object.assign(
    config.get('sync-s3'),
    {
      destPath: options.srcPath,
      concurrency: 2,
      retries: 3,
      clearCache: false
    },
    options
  )
  if (!options.srcPath) throw new Error('srcPath required')
  if (!options.accessKeyId) throw new Error('accessKeyId required')
  if (!options.secretAccessKey) throw new Error('secretAccessKey required')
  if (!options.region) throw new Error('region required')

  // get source
  const src = readdir.stream.stat(options.srcPath, {deep: true})

  // set up s3
  Object.assign(AWS.config, {
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    region: options.region
  })
  // dbg(AWS.config)
  const s3 = new AWS.S3()

  function wrappedWorker (file) { return worker(file, options, s3) }

  const spool = new Spool(wrappedWorker, src, options.concurrency)
  spool.defer.promise()
  .then(() => dbg('done'))

  vow.resolve()
  .then(() => {
    // clear cache if required
    if (options.clearCache) return valueCache.invalidate()
  })
  .then(() => {
    src.on('readable', spool.tick.bind(spool))
  })
}

class Spool {
  constructor (worker, stream, concurrency) {
    this.concurrency = concurrency
    this.worker = worker
    this.stream = stream
    this.defer = vow.defer()
    this.workers = 0
    this.count = 0
  }
  tick () {
    let state = this.stream._readableState
    if (this.workers === this.concurrency) return
    if (state.ended && this.workers === 0) return this.defer.resolve()
    if (!state.length) return
    this.workers++
    let read = this.stream.read()
    this.worker(read, this.retry.bind(this))
    .then(() => {
      this.count++
      this.workers--
      // dbg(`${this.workers}/${this.count}`)
      process.nextTick(this.tick.bind(this))
    })
    if (this.workers < this.concurrency) process.nextTick(this.tick.bind(this))
  }
  retry (item) {
    this.stream.unshift(item)
    this.count--
  }
}

function worker (file, options, s3) {
  const params = {}
  // discard directories
  if (file.isDirectory()) return vow.resolve()
  file.fullPath = resolve(options.srcPath, file.path)
  Object.assign(file, parse(file.fullPath))
  return vow.resolve()
  .then(() => readFileToBuffer(file.fullPath))
  .then((buffer) => {
    // check if current hash matches cache
    file.md5 = md5(buffer)
    // build payload
    params.Bucket = options.bucket
    params.Key = join(options.destPath, file.path)
    params.Body = buffer
    return valueCache.retrieve(file.path).catch(() => false)
  })
  .then((cached) => {
    if (cached === file.md5) throw new Error('cached')
    // detect mime
    return getMime(file.path, params.Body)
  })
  .then((mimeType) => {
    params.ContentType = mimeType
    return upload(params, file, options, s3)
  })
  .catch((err) => {
    if (err.message === 'cached') {
      dbg(`ignoring cached ${file.path}`)
    } else {
      throw err
    }
  })
}
function upload (params, file, options, s3) {
  if (params.retries >= options.maxRetries) {
    dbg(`max retries (${options.maxRetries}) exceeded for ${file.path}`)
    return vow.reject('maxRetries')
  }
  dbg(`uploading ${file.path} (${params.ContentType})`)
  return vow.resolve()
  .then(() => putS3(params, s3))
  .then((data) => {
    // successful upload
    return valueCache.store(file.path, file.md5)
  })
  .catch((err) => {
    if (
      err.name === 'UnknownEndpoint'
    ) {
      dbg(`${err.name} thrown for ${file.path}, will retry`)
      // pushing back onto src readable doesn't seem to work.
      // count retries
      params.retries = params.retries ? params.retries + 1 : 1
      // promise returned by current call to `upload` won't resolve until
      // this next call is resolved. This allows throttle to manage workers
      // correctly
      return upload(params, file)
    } else {
      dbg(err.name)
      dbg(err.message)
      throw err
    }
  })
}

function readFileToBuffer (path) {
  const defer = vow.defer()
  readFile(path, (err, buffer) => {
    if (err) defer.reject(err)
    defer.resolve(buffer)
  })
  return defer.promise()
}
function getMime (filePath, buffer) {
  const defer = vow.defer()
  let mimeType = mime.lookup(filePath)
  if (mimeType) {
    defer.resolve(mimeType)
  } else {
    magic.detect(buffer, (err, mimeType) => {
      if (err) defer.reject(err)
      defer.resolve(mimeType)
    })
  }
  return defer.promise()
}
function putS3 (params, s3) {
  const defer = vow.defer()
  s3.putObject(params, (err, data) => {
    if (err) defer.reject(err)
    defer.resolve(data)
  })
  // .on('httpUploadProgress', (data) => {
  //   // nope
  // })
  // .on('httpDone', () => {
  //     // yeah nah
  // })

  return defer.promise()
}
