

## all the things

Everyone loves metalsmith's agnostic, dogma free approach to static sites... but it's still nice to see some examples, so this is mine.

### features

 * webpack - I'm pretty stoked with my webpack implementation. `metalsmith-webpack` caches webpack output which dramatically cuts down on build time.
 * browser-sync - take a look at `./sync.js`, it's a super minimal implementation that just works. browser-sync takes care of live reloading & dev server
 * naked urls - (urls like `domain.com/article-name` without the `.html`) this is achieved using mimeTypes rather than the hacky everything-in-a-separate-directory approach.
 * s3 - custom upload to s3 implementation
 * babel - scandalous babel-node usage.. cuts down on crufty build & watch scripts
 * google-drive - scrape content from google drive folders to include in your build. Think of it as a poor mans CMS, free ubiquitous access for editing content.
 * cloudinary - upload images to cloudinary, then format them as required in your layouts & markdown. This means no local dependencies on imagemagick and friends.

### usage

```bash
git clone git@github.com:leviwheatcroft/metalsmith-all-the-things.git matt
cd matt
npm i
npm run dev
```

### boulevard of broken dreams

There's a few dependencies which are not yet available on npm. You can install them directly from github. See `src/articles/rogue-packages.md` for details.

### license

MIT

### author

Levi Wheatcroft <levi@wht.cr>
