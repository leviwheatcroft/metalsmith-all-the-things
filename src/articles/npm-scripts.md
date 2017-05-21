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


```json
"scripts": {
  "dev": "concurrently --raw \"npm run watch\" \"npm run serve\" \"npm run sync\" ",
  "build": "cross-env DEBUG=metalsmith* babel-node build",
  "serve": "cross-env DEBUG=metalsmith* babel-node serve",
  "sync": "browser-sync start --config bs-config.js",
  "watch": "npm-watch build:lr",
  "deploy": "cross-env DEBUG=metalsmith* babel-node deploy",
  "docs": "./node_modules/docker/docker -o ./docs -x .README.md,README.md,test,node_modules,notes,docs,.git",
  "readme": "node ./node_modules/.bin/node-readme"
},
```
