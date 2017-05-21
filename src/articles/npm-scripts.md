---
layout: cleanBlogPost.hbs
title: npm scripts
author: Levi Wheatcroft
publishedDate: 2017-01-03
tags:
 - node
collection: posts
cover: images/lost-places
draft: false
exerpt: a quick look at the npm scripts
---

The scripts stanza from package.json

```json
"scripts": {
  "build": "cross-env DEBUG=metalsmith* babel-node build",
  "sync": "cross-env DEBUG=metalsmith* babel-node sync",
  "deploy": "cross-env DEBUG=metalsmith* babel-node deploy",
  "watch": "nodemon --exec \"npm run build\"",
  "dev": "concurrently --raw \"npm run watch\" \"npm run sync\" "
},
```

`build`, `sync`, and `deploy` are simply wrappers around the repo's three entry points of the same names.

`watch` wraps the `build` script with a nodemon configuration, which will restart the build script on change.

`dev` just runs the browser-sync server & the watch / build task concurrenly.
