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
import {
  Writable
} from 'stream'
import readdir from 'readdir-enhanced'
import {
  // createReadStream as readStream,
  readFile,
  readFileSync,
  existsSync as exists,
  mkdirSync as mkdir
} from 'fs'
import md5 from 'md5'
import persist from 'node-persist'
import vow from 'vow'
import mime from 'mime-types'

const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)

export default function sync (options) {
  // massage options
  const required = ['srcPath', 'accessKeyId', 'secretAccessKey', 'region']
  if (typeof options === 'string') options = { srcPath: options }
  if (!options.srcPath) throw new Error('srcPath required')
  options = Object.assign(
    config.get('sync-s3'),
    {
      destPath: options.srcPath,
      concurrency: 10,
      debugNamespace: 'sync-s3',
      highWaterMark: 20,
      retries: 7,
      cacheRoot: '.store'
    },
    options
  )
  console.log(options.accessKeyId)
  required.forEach((option) => {
    if (options[option]) return
    throw new Error(`sync-s3 '${option}' option required`)
  })

  // get source
  const src = readdir.stream.stat(options.srcPath, {deep: true})

  // set up debug
  const dbg = debug(options.debugNamespace)

  // set up cache
  const re = new RegExp(options.cacheRoot)
  if (!re.exec(readFileSync('.gitignore').toString())) {
    dbg(`WARN: you may want to .gitignore the ${options.cacheRoot} folder`)
  }
  if (!exists(options.cacheRoot)) mkdir(options.cacheRoot)
  const cache = persist.create({ dir: join(options.cacheRoot, 'deploy-cache') })
  cache.initSync()

  // set up s3
  Object.assign(AWS.config, {
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    region: options.region
  })
  dbg(AWS.config)
  const s3 = new AWS.S3()

  // cool singleton pattern for Writable stream
  const supervisor = Object.assign(
    new Writable({
      objectMode: true,
      highWaterMark: options.highWaterMark
    }),
    {
      workers: 0,
      _write: function (file, encoding, next) {
        const params = {}
        // discard directories
        if (file.isDirectory()) return next()
        this.workers++
        file.fullPath = resolve(options.srcPath, file.path)
        Object.assign(file, parse(file.fullPath))
        vow.resolve()
        .then(() => readFileToBuffer(file.fullPath))
        .then((buffer) => {
          // check if current hash matches cache
          file.md5 = md5(buffer)
          file.md5 = 'md5'
          if (cache.getItemSync(file.path) === file.md5) {
            throw new Error('cached')
          }
          // build payload
          params.Bucket = options.bucket
          params.Key = join(options.destPath, file.path)
          params.Body = buffer
          // detect mime
          return getMime(file.path, params.Body)
        })
        .then((mimeType) => {
          params.ContentType = mimeType
          // put
          return this.upload(params, file)
        })
        .catch((err) => {
          if (err.message === 'cached') {
            dbg(`ignoring cached ${file.path}`)
          } else {
            throw err
          }
        })
        .then(() => {
          this.workers--
          next()
        })

        if (this.workers < options.concurrency) {
          // next can only be called once
          // call next here to spawn another worker (kind of)
          next()
          // but then noop next for when it's called later
          next = () => {}
        }
      },
      upload: function (params, file) {
        if (params.retries >= options.maxRetries) {
          dbg(`max retries (${options.maxRetries}) exceeded for ${file.path}`)
          return vow.reject('maxRetries')
        }
        dbg(`uploading ${file.path} (${params.ContentType})`)
        return vow.resolve()
        .then(() => putS3(params, s3))
        .then((data) => {
          // successful upload
          cache.setItemSync(file.path, file.md5)
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
            return this.upload(params, file)
          } else {
            dbg(err.name)
            dbg(err.message)
            throw err
          }
        })
      }
    }
  )
  src.pipe(supervisor)
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
