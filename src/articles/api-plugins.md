---
layout: cleanBlogPost.hbs
title: api plugins
author: Levi Wheatcroft
publishedDate: 2017-05-19
tags:
 - node
 - cloudinary
collection: posts
cover: images/iris
draft: false
exerpt: metalsmith-cloudinary and metalsmith-google-drive need some additional explanation
---

Both metalsmith-cloudinary and metalsmith-google-drive interact with http apis during the build process.

Conceptually, all they're doing is moving files between locations / storage services. Those locations are:

 * your src folder (src) - simply the `src` directory on your hard drive
 * metalsmith files structure (metalsmith) - this is kind of the virtual file system that only exists during the build process. It's the files argument that gets passed to each plugin
 * your build folder (build) - the `build` directory on your hard drive, updated once the metalsmith build process is done.
 * the api storage (api) - files stored in google drive or cloudinary
 * plugin cache (cache) - both plugins implement a cache containing the data stored in the api storage

So, in the general course (without using these plugins), metalsmith reads from `src` to `metalsmith`, plugins do their magic, then writes the manipulated data to build.

### metalsmith-google-drive

`metalsmith-google-drive` simply scrapes files from `api` to `cache`, then writes `cache` to `metalsmith`. So after this plugin is called, your `metalsmith` files structure will contain everything in `src` and everything from the specified location in your `api`.

### metalsmith-cloudinary

`metalsmith-cloudinary` is similar but basically reversed, because of the nature of cloudinary. To "use" images stored on cloudinary you don't need a copy of that image in your `build` or `metalsmith`, you just need a reference to that file provided by cloudinary. However, the plugin also uploads your images to cloudinary during the build process so they're there ready to access. So when this plugin is called it:

 * uploads images from `metalsmith` to `api`
 * downloads the image meta to `cache`
 * writes the `cache` to metalsmith's meta, ready to be used by templates.

See also: [cloudinary urls]('/articles/cloudinary-urls')

### marked-cloudinary && handlebars-cloudinary

Both these template / layout helpers simply construct  urls around a cloud name like `see-me-rollin`. You provide a file name & args, and they return the cloudinary url.

### see me rollin repo

These plugins have been included in this repo, but are disabled by default so you can `npm start` and have something to play with, without needing to set up your api keys.

So if the google drive plugin is enabled it's going to populate `src/articles` for you, with the contents of whichever drive folder you point it at. While it's disabled this demo is just going to use the files included in the repo at that path.

If the cloudinary plugin is enabled, it's going to populate your cloudinary account with the images stored in `src/images`.

When you `npm start` with the cloudinary plugin disabled, the `marked-cloudinary` and `handlebars-cloudinary` are still going to do their thing and build real live urls.
