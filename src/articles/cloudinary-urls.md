---
layout: cleanBlogPost.hbs
title: cloudinary urls
author: Levi Wheatcroft
publishedDate: 2017-05-19
tags:
 - cloudinary
collection: posts
cover: images/iris
draft: false
exerpt: handlebars-cloudinary & marked-cloudinary explained
---

Using the images stored on cloudinary requires building a url. You could do it manually but of course that's not how we roll right ?

### pug
Pug is my favourate template renderer and this is a pretty good example of why. You can access the cloudinary api directly from within the template like so:

`img(src=cloudinary['images/coal-mine'].url({width:1600, height:800}))`

### handlebars
To pull the same stunt in handlebars you need a helper like [handlebars-cloudinary](https://github.com/leviwheatcroft/handlebars-cloudinary).

See handlebars-cloudinary readme for usage, or see it in action in `lib/plugins.js` but this helper will allow you to get cloudinary urls in handlebars like this:

`<img src="{{cloudinary 'images/coal-mine' '{width:1600, height:800, crop:"fill"}'}}"`

In this repo, layouts use a call like this to get a url for each page's cover. See it in `layouts/cleanBlog/header.hbs`.

### markdown
You can use a [marked-cloudinary](https://github.com/leviwheatcroft/marked-cloudinary) to include your cloudinary images in markdown too.

Again, see marked-cloudinary readme for usage, or see it in use in `lib/plugins.js`. You can generate images in your markdown like this:

`![image alt](cloudinary_id "image title { width: 400, height: 300, crop: \'fill\'}")`

It will render like this:

`<p><img src="http://res.cloudinary.com/see-me-rollin/image/upload/c_fill,h_300,w_400/v1/images/coal-mine" alt="coal mine"> &quot;coal mine &quot;</p>`

Which, without additional styling, will look like this. The `&quot;` and `<p>` tag is normal marked behaviour. Of course you can modify the appearance with your own styling.

![coal mine](images/coal-mine "coal mine { width: 400, height: 300, crop: 'fill'}")
