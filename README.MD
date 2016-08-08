# Karkas.js

**Version: 3.0.0**

A powerfull template engine for JavaScript inspired by AngularJS.

## About
Karkas allows to you to parse and filter JSON objects or arrays directly as HTML assets to your web application.

**Attention!** This version isn't compatible with previous major versions of library. To get previous version, checkout `2.x` branch. 


## Compatibility
This library was written in ES5 but compatible with ES4.

Karkas is independent **node.js** module and can be used as part of node application.
Also it can be used on front-end using **Browserify**.

Full support of Chrome, Firefox, Internet Explorer 9+.

## Installation
**Front-end**:
You can install Karkas with **Bower** package manager - `bower install karkas` or just download the source code from this repo.

**Node:**
Just run `npm install karkas` and connect it as node module.

## Build Library
This package already contains builded .js file, but you can
modify it and build your own package.

To build Karkas for usage in front-end as standalone library,
you have to install **Browserify** and compile `build.js` file.

To do this, just run:
```
npm install -g browserify
browserify ./build.js -o ./dist/karkas.js -d
```

## JSDoc
Original non-compiled sources have embedded JSDoc markup, that allows to read documentation in your IDE.

## Tutorial

Tutorial is included in **example** folder.


