/**
 * ## configs
 * these aren't real working keys.
 * you need to copy these keys to config/local.js, make sure that file is
 * .gitignored, then set your actual keys there. No need to delete this file,
 * values here are overridden
 */

module.exports = {
  'meta': {
    siteTitle: 'All The Things',
    description: 'Metalsmith demo with all the things.',
    url: 'localhost'
  },
  'sync-s3': {
    accessKeyId: 'AKIAIX6KIAIV6U2SPHQ',
    secretAccessKey: 'CcjqyZgQ5MpVkXEMEiD6kLMmRvWfEFHN47MbvSz8',
    region: 'ap-southeast-2'
  },
  'metalsmith-google-drive': {
    enabled: false,
    client_id: '523895197708-ov8sffqdmo14a02ds2dc9pr7snp513r2.apps.googleusercontent.com',
    client_secret: 'DM9ccOH9lfMJB_4EEiy_p3ij',
    redirect_uris: [
      'urn:ietf:wg:oauth:2.0:oob',
      'http://localhost'
    ]
  },
  'metalsmith-cloudinary': {
    enabled: false,
    cloud_name: 'all-the-things',
    api_key: '927297772351274',
    api_secret: 'Tk-Q6ENrWHJ66FT-oDSqJVTVNW8'
  },
  debugNamespace: 'att',
  'images-drive-folder': '0B1QpLgu4mpt8UXBRWEVxblhVbzg',
  'articles-drive-folder': '0B1QpLgu4mpt8R1hHWi1wWFkyV2s'
}
