# Karkas.js

**Version: 4.0.0**

A powerfull template engine for JavaScript inspired by AngularJS.

## About
Karkas allows to you to parse and filter JSON objects or arrays directly as HTML assets to your web application.

Demo and docs are available [here](https://odin3.github.io/karkas).

**Attention!** This version isn't compatible with previous major versions of library. To get previous version, checkout `2.x` branch. 


## Compatibility
This library was written in TypeScript and contains pre-compiled ES5 code.

Karkas is independent **node.js** module and can be used as part of node application.
Also it can be used on front-end using **Browserify**.

Full support of Chrome, Firefox, Internet Explorer 9+.

## Usage
**Without module bundler**:
Precompiled and minified version is available as `karkas.min.js` file in `dist` folder.

**With module bundler**
Just import karkas library:

```
import karkas from 'karkas';

// Your code here
```



## Installation
**Front-end**:
You can install Karkas with **Bower** package manager - `bower install karkas` or just download the source code from this repo.

**Node:**
Just run `npm install karkas` and connect it as node module.

## Build Library
This package already contains builded `karkas.min.js` file at `dist` folder, but you can
modify it and build your own package.

To build Karkas for usage in front-end as standalone library

To do this, just run:
```
npm install && npm install --only=dev
npm run start
```

## Tutorial

Tutorial is included in **docs** folder and [here](https://odin3.github.io/karkas).


