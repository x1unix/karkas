(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.karkas = require('./karkas.js')(true);
},{"./karkas.js":2}],2:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 * 
 * @package karkas
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

/**
 * Call a new Karkas instance
 * @param useDomExtensions bool Include DOM extension
 * @returns {*}
 */
module.exports = function(useDom) {
   var karkas = require('./src/core.js')();
    if( useDom ) require('./src/dom.js')(karkas);
    return karkas;
};
},{"./src/core.js":3,"./src/dom.js":4}],3:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.core
 * @version 3.0.0-b4
 * @author Denis Sedchenko
 */
var Karkas = function() {

    function def(el) {
        return typeof el != 'undefined';
    }

    var self = this;

    this.version = {
        'major': 3,
        'minor': 0,
        'patch': 0,
        'build': 7,
        'toString': function() {
            with(this) {
                return[major, minor, patch].join('.');
            }
        }
    };

    this.views = {};
    this.filters = {
        __container__: {},
        /**
         * Get Filter
         */
        get: function(filterName) {
            if(typeof this.__container__[filterName] == "undefined") throw new ReferenceError("Karkas: undefined filter or template: '"+filterName+"'");
            return this.__container__[filterName];
        },

        /**
         * Add filter
         */
        add: function(filterName, func) {
            this.__container__[filterName] = func;
        }

    };

    require('./view.js')(self);
    require('./filters.js')(self);

    this.getView = function(vId) {
        if(typeof self.views[vId] == "undefined") throw new ReferenceError("KarkasJS: Requested template is not defined: '"+vId+"'");
        return self.views[vId];
    };

    this.clear = function() {
        for(var i in self.views) {
            delete this.views[i];
        }
    };

    this.exists = function(templateName) {
        return def(this.views[templateName]);
    };

    this.log = function(msgTxt, msgType) {
        msgType = msgType || 'log';
        msgTxt  = "Karkas: "+msgTxt;
        return ( def(console) && def(console[msgType]) ) ? console[msgType](msgTxt) : null;
    };

    this.filter = function(filterQuery, value) {

        // Extract filter name and args
        filterQuery = filterQuery.trim().split(":");
        var filterName = filterQuery[0];

        // Array of arguments that we will push to the filter
        // At start there will be only expression value
        value = [value];

        // Try to find another args
        if(filterQuery.length > 1) {
            var filterArgs = (new Function("return ["+filterQuery[1].trim()+"]"))();
            value = value.concat(filterArgs);
        }

        try {
            // Find and call the filter with selected args
            var filter = self.filters.get(filterName);
            return filter.apply(filter,value);
        } catch(ex) {
            throw new Error("Karkas: failed to apply filter '"+filterName+"', reason: "+ex.message);
        }
    };

    this.compile = function(templateName, content) {

        // Output buffer
        var output   = "",
            template = self.getView(templateName);

        content = content || {};

        // If we have an array, parse as array
        output = template[(content instanceof Array) ? "parseArray" : "parse"](content);

        return output;

    };

    this.getView = function(vId) {
        if( !def(self.views[vId]) ) throw new ReferenceError("KarkasJS: Requested template is not defined: '"+vId+"'");
        return self.views[vId];
    };


};

module.exports = function() {
    return new Karkas();
};
},{"./filters.js":5,"./view.js":14}],4:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.dom
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(karkas) {
    function def(e) { return typeof e !== 'undefined'; }
    function nul(e) { return e === null }

    if( !def(window) ) throw new ReferenceError('Karkas DOM extensions requries browser');
    if( !def(window.document) ) throw new Error('Karkas DOM extensions requires a document object');

    var $d = window.document;
    var $b = $d.querySelector('body');

    var COMPILED_ELEMENT_SELECTOR   = '*[data-compile]',
        COMPILED_ELEMENT_DATA       = 'data-compile',
        COMPILED_ELEMENT_TEMPLATE   = 'data-view',
        VIEW_SCRIPT_MIME_TYPE       = 'text/karkas';

    karkas.onFind = function() {};

    karkas.compileElement = function(element) {
        var tempName = element.getAttribute(COMPILED_ELEMENT_TEMPLATE),
            tempData = element.getAttribute(COMPILED_ELEMENT_DATA);

        if( nul(tempName) ) throw new ReferenceError(COMPILED_ELEMENT_TEMPLATE+' is undefined');
        if( nul(tempData) ) throw new ReferenceError(COMPILED_ELEMENT_DATA+' is undefined');

        tempName = tempName.trim();
        tempData = tempData.trim();

        try {
            tempData = JSON.parse(tempData);
            element.innerHTML += karkas.compile(tempName, tempData);
        } catch(ex) {
            karkas.log(
                {
                    message: 'Karkas: failed to compile element',
                    error:   ex,
                    element: element
                }, 'error');
        }
    };


    karkas.refresh = function(refreshItems) {
        // Views container
        if(refreshItems) this.clear();

        var templateSelector = 'script[type="'+VIEW_SCRIPT_MIME_TYPE+'"]';
        if(!refreshItems) templateSelector += ':not([data-loaded])';

        // Select all templates
        var w = $d.querySelectorAll(templateSelector);

        // Grep all elements
        for(var c = 0;  c < w.length; c++ )
        {
            ( new karkas.View(w[c].getAttribute("name"), w[c].innerHTML) ).apply();
        }

        // find items by attr and parse them
        var requestedToParse = $d.querySelectorAll(COMPILED_ELEMENT_SELECTOR);

        if(!requestedToParse.length) return true;

        for(var i = 0; i < requestedToParse.length; i++) {
            karkas.compileElement(requestedToParse[i]);
        }

        if(typeof this.onFind == 'function') this.onFind();
    };

    /**
     * Import content as template from remote URL
     * @param url {String} URL Path
     * @param templateName {String} Template name
     * @param successCallback {Function} onSuccess callback
     */
    karkas.include = function(url, templateName, successCallback) {

        function makeRequest(onSuccess, onError) {
            var xhr = new XMLHttpRequest();

            onError = onError || function(e) { console.error(e);};

            xhr.open("GET", url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {

                    var template = new karkas.View(templateName, xhr.response);
                    template.apply();

                    onSuccess(template, xhr.response);
                } else {
                    onError({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                if ( def(onError) ) {
                    onError({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                } else {
                    console.error('Karkas: Failed to import remote template: ',{
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }

            };
            xhr.send();
        }

        if( typeof url !== 'string' ) throw new ReferenceError('Karkas: Url is not a String');
        templateName = templateName || url;
        if( (typeof successCallback == 'function') || !('Promise' in window) ) return makeRequest(successCallback);

        return new Promise(makeRequest);
    };

    document.addEventListener('DOMContentLoaded', karkas.refresh);

};
},{}],5:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Karkas embedded filters
 *
 * @package karkas.filters
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */
module.exports = function(karkas) {
    with(karkas.filters) {
        add('currency', require('./filters/currency.js') );
        add('string', require('./filters/string.js') );
        add('array', require('./filters/array.js') );
        add('math', require('./filters/math.js') );
        add('json', require('./filters/json.js') );
        add('capitalize', require('./filters/capitalize.js') );
        add('toLower', require('./filters/toLower.js') );
        add('toUpper', require('./filters/toUpper.js') );
    }

};
},{"./filters/array.js":6,"./filters/capitalize.js":7,"./filters/currency.js":8,"./filters/json.js":9,"./filters/math.js":10,"./filters/string.js":11,"./filters/toLower.js":12,"./filters/toUpper.js":13}],6:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Array filter
 *
 * @package karkas.filters.array
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function($value, $operation) {
    try {
        var $args = [].splice.apply(arguments,[2]);
        return ([])[$operation].apply($value,$args);
    } catch(ex) {
        throw new Error("Failed to perform method `Array."+$operation+"` ("+ex.message+")");
    }
};
},{}],7:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.filters.capitalize
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(val) {
    val = String(val);
    return val.substring(0,1).toUpperCase()+val.substring(1);
};
},{}],8:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Currency filter
 * 
 * @package karkas.filters.currency
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function($value, $currency, $digitsToFixed) {
    // Currency by default is USD
    $currency = $currency || "$";


    function formatMoney(n, c, d, t){
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }

    return $currency+" "+formatMoney($value, $digitsToFixed);


};
},{}],9:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * JSON filter
 *
 * @package karkas.filters.json
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(val) {
    try {
        return JSON.stringify(val);
    } catch(ex) {
        return val;
    }
};
},{}],10:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Math filter
 *
 * @package karkas.filters.math
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function($value, $operation) {
    try {
        [].splice.apply(arguments,[1,1]);
        return Math[$operation].apply(Math,arguments);
    } catch(ex) {
        throw new Error("Failed to perform method `Math."+$operation+"` ("+ex.message+")");
    }
};
},{}],11:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * String filter
 *
 * @package karkas.filters.string
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function($value, $operation) {
    try {
        var $args = [].splice.apply(arguments,[2]);
        return ""[$operation].apply($value,$args);
    } catch(ex) {
        throw new Error("Failed to perform method `String."+$operation+"` ("+ex.message+")");
    }
};
},{}],12:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.filters.toLower
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(val) {
    return String(val).toLowerCase();
};
},{}],13:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.filters.toUpper
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(val) {
    return String(val).toUpperCase();
};
},{}],14:[function(require,module,exports){
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.view
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(karkas) {
    function def(el) {
        return typeof el != 'undefined';
    }

    karkas.View = function(name, content) {
      if(!def(content)) throw new ReferenceError("Karkas.View: viewElement is not defined.");
      if(typeof content !== 'string') throw new ReferenceError('Karkas.View: Template content must be a string');

      /**
       * Pattern for expressions ( {{value}} )
       */
      this.pattern    = /[\{\{](.*?)[\}\}]+/gim;


      this.name       = name;
      this.content    = content.trim();

      var self        = this;

      this.apply = function(replaceIfExists) {
          replaceIfExists = replaceIfExists || false;
          if(karkas.exists(this.name) && !replaceIfExists) {
              karkas.log('Cannot apply new template, "'+this.name+'" already exists. Use "apply(true)" to overwrite it.', 'warn');
              return false;
          }
          karkas.views[self.name] = this;
          return true;
      };


      /**
       * Parse single expression from object
       * @param   {Object} $_object     Object
       * @param   {String} $_expression Expression
       * @returns {*} Value
       */
      function parseExpression($_object, $_expression) {
          return new Function('with(this) { return '+$_expression+'; }').apply($_object);
      }


      /**
       * Parse an single object using the template
       * @param fields Object
       * @returns {*} Compiled content
       */
      this.parse      = function(fields) {
          var sReturn    = this.content.toString(),
              tpFields   = sReturn.match(this.pattern);

          for(var pat in tpFields){
              var currentField = tpFields[pat];
              if(typeof currentField == "string" || typeof currentField == "number"){
                  // Remove brackets and extract filters
                  var key = currentField.replace("{{","").replace("}}","").trim().split("|");

                  // Check for filters and expressions
                  var filter = (key.length > 1) ? key[key.length - 1] : undefined;
                  key = key[0];

                  //  replace expression with object
                  var newVal;
                  try {
                      newVal = parseExpression(fields, key);
                  } catch(ex) {
                      throw new ReferenceError("Karkas: failed to parse expression '"+key+"' in template '"+this.name+"'. "+ex.message);
                  }
                  // If value is undefined - replace it
                  if( !def(newVal) ) newVal = "";

                  // Use filter or template if available in expression
                  if( def(filter))  newVal = karkas[(def(karkas.views[filter])) ? "compile" : "filter"](filter, newVal);

                  sReturn = sReturn.replace(currentField,newVal);
              }
          }
          return sReturn;
      };


      /**
       * Parse an array of objects using the template
       * @param arr
       * @returns {string} Compiled content
       */
      this.parseArray = function(arr) {
          var c = "";
          for(var i = 0; i < arr.length; i++) {
              c += this.parse(arr[i]);
          }
          return c;
      };

  };
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJ1aWxkLmpzIiwia2Fya2FzLmpzIiwic3JjL2NvcmUuanMiLCJzcmMvZG9tLmpzIiwic3JjL2ZpbHRlcnMuanMiLCJzcmMvZmlsdGVycy9hcnJheS5qcyIsInNyYy9maWx0ZXJzL2NhcGl0YWxpemUuanMiLCJzcmMvZmlsdGVycy9jdXJyZW5jeS5qcyIsInNyYy9maWx0ZXJzL2pzb24uanMiLCJzcmMvZmlsdGVycy9tYXRoLmpzIiwic3JjL2ZpbHRlcnMvc3RyaW5nLmpzIiwic3JjL2ZpbHRlcnMvdG9Mb3dlci5qcyIsInNyYy9maWx0ZXJzL3RvVXBwZXIuanMiLCJzcmMvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmthcmthcyA9IHJlcXVpcmUoJy4va2Fya2FzLmpzJykodHJ1ZSk7IiwiLyoqXG4gKiBLYXJrYXMuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9vZGluMy9rYXJrYXMpXG4gKiBMaWNlbnNlZCBieSBNSVQgbGljZW5zZVxuICogXG4gKiBAcGFja2FnZSBrYXJrYXNcbiAqIEB2ZXJzaW9uIDMuMC4wLWIxXG4gKiBAYXV0aG9yIERlbmlzIFNlZGNoZW5rb1xuICovXG5cbi8qKlxuICogQ2FsbCBhIG5ldyBLYXJrYXMgaW5zdGFuY2VcbiAqIEBwYXJhbSB1c2VEb21FeHRlbnNpb25zIGJvb2wgSW5jbHVkZSBET00gZXh0ZW5zaW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VEb20pIHtcbiAgIHZhciBrYXJrYXMgPSByZXF1aXJlKCcuL3NyYy9jb3JlLmpzJykoKTtcbiAgICBpZiggdXNlRG9tICkgcmVxdWlyZSgnLi9zcmMvZG9tLmpzJykoa2Fya2FzKTtcbiAgICByZXR1cm4ga2Fya2FzO1xufTsiLCIvKipcbiAqIEthcmthcy5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29kaW4zL2thcmthcylcbiAqIExpY2Vuc2VkIGJ5IE1JVCBsaWNlbnNlXG4gKlxuICogQHBhY2thZ2Uga2Fya2FzLmNvcmVcbiAqIEB2ZXJzaW9uIDMuMC4wLWI0XG4gKiBAYXV0aG9yIERlbmlzIFNlZGNoZW5rb1xuICovXG52YXIgS2Fya2FzID0gZnVuY3Rpb24oKSB7XG5cbiAgICBmdW5jdGlvbiBkZWYoZWwpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBlbCAhPSAndW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnZlcnNpb24gPSB7XG4gICAgICAgICdtYWpvcic6IDMsXG4gICAgICAgICdtaW5vcic6IDAsXG4gICAgICAgICdwYXRjaCc6IDAsXG4gICAgICAgICdidWlsZCc6IDcsXG4gICAgICAgICd0b1N0cmluZyc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd2l0aCh0aGlzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuW21ham9yLCBtaW5vciwgcGF0Y2hdLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnZpZXdzID0ge307XG4gICAgdGhpcy5maWx0ZXJzID0ge1xuICAgICAgICBfX2NvbnRhaW5lcl9fOiB7fSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBGaWx0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGdldDogZnVuY3Rpb24oZmlsdGVyTmFtZSkge1xuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuX19jb250YWluZXJfX1tmaWx0ZXJOYW1lXSA9PSBcInVuZGVmaW5lZFwiKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJLYXJrYXM6IHVuZGVmaW5lZCBmaWx0ZXIgb3IgdGVtcGxhdGU6ICdcIitmaWx0ZXJOYW1lK1wiJ1wiKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9fY29udGFpbmVyX19bZmlsdGVyTmFtZV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBmaWx0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGFkZDogZnVuY3Rpb24oZmlsdGVyTmFtZSwgZnVuYykge1xuICAgICAgICAgICAgdGhpcy5fX2NvbnRhaW5lcl9fW2ZpbHRlck5hbWVdID0gZnVuYztcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHJlcXVpcmUoJy4vdmlldy5qcycpKHNlbGYpO1xuICAgIHJlcXVpcmUoJy4vZmlsdGVycy5qcycpKHNlbGYpO1xuXG4gICAgdGhpcy5nZXRWaWV3ID0gZnVuY3Rpb24odklkKSB7XG4gICAgICAgIGlmKHR5cGVvZiBzZWxmLnZpZXdzW3ZJZF0gPT0gXCJ1bmRlZmluZWRcIikgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiS2Fya2FzSlM6IFJlcXVlc3RlZCB0ZW1wbGF0ZSBpcyBub3QgZGVmaW5lZDogJ1wiK3ZJZCtcIidcIik7XG4gICAgICAgIHJldHVybiBzZWxmLnZpZXdzW3ZJZF07XG4gICAgfTtcblxuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKHZhciBpIGluIHNlbGYudmlld3MpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnZpZXdzW2ldO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZXhpc3RzID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBkZWYodGhpcy52aWV3c1t0ZW1wbGF0ZU5hbWVdKTtcbiAgICB9O1xuXG4gICAgdGhpcy5sb2cgPSBmdW5jdGlvbihtc2dUeHQsIG1zZ1R5cGUpIHtcbiAgICAgICAgbXNnVHlwZSA9IG1zZ1R5cGUgfHwgJ2xvZyc7XG4gICAgICAgIG1zZ1R4dCAgPSBcIkthcmthczogXCIrbXNnVHh0O1xuICAgICAgICByZXR1cm4gKCBkZWYoY29uc29sZSkgJiYgZGVmKGNvbnNvbGVbbXNnVHlwZV0pICkgPyBjb25zb2xlW21zZ1R5cGVdKG1zZ1R4dCkgOiBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLmZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlclF1ZXJ5LCB2YWx1ZSkge1xuXG4gICAgICAgIC8vIEV4dHJhY3QgZmlsdGVyIG5hbWUgYW5kIGFyZ3NcbiAgICAgICAgZmlsdGVyUXVlcnkgPSBmaWx0ZXJRdWVyeS50cmltKCkuc3BsaXQoXCI6XCIpO1xuICAgICAgICB2YXIgZmlsdGVyTmFtZSA9IGZpbHRlclF1ZXJ5WzBdO1xuXG4gICAgICAgIC8vIEFycmF5IG9mIGFyZ3VtZW50cyB0aGF0IHdlIHdpbGwgcHVzaCB0byB0aGUgZmlsdGVyXG4gICAgICAgIC8vIEF0IHN0YXJ0IHRoZXJlIHdpbGwgYmUgb25seSBleHByZXNzaW9uIHZhbHVlXG4gICAgICAgIHZhbHVlID0gW3ZhbHVlXTtcblxuICAgICAgICAvLyBUcnkgdG8gZmluZCBhbm90aGVyIGFyZ3NcbiAgICAgICAgaWYoZmlsdGVyUXVlcnkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdmFyIGZpbHRlckFyZ3MgPSAobmV3IEZ1bmN0aW9uKFwicmV0dXJuIFtcIitmaWx0ZXJRdWVyeVsxXS50cmltKCkrXCJdXCIpKSgpO1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jb25jYXQoZmlsdGVyQXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRmluZCBhbmQgY2FsbCB0aGUgZmlsdGVyIHdpdGggc2VsZWN0ZWQgYXJnc1xuICAgICAgICAgICAgdmFyIGZpbHRlciA9IHNlbGYuZmlsdGVycy5nZXQoZmlsdGVyTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyLmFwcGx5KGZpbHRlcix2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkthcmthczogZmFpbGVkIHRvIGFwcGx5IGZpbHRlciAnXCIrZmlsdGVyTmFtZStcIicsIHJlYXNvbjogXCIrZXgubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5jb21waWxlID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lLCBjb250ZW50KSB7XG5cbiAgICAgICAgLy8gT3V0cHV0IGJ1ZmZlclxuICAgICAgICB2YXIgb3V0cHV0ICAgPSBcIlwiLFxuICAgICAgICAgICAgdGVtcGxhdGUgPSBzZWxmLmdldFZpZXcodGVtcGxhdGVOYW1lKTtcblxuICAgICAgICBjb250ZW50ID0gY29udGVudCB8fCB7fTtcblxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGFycmF5LCBwYXJzZSBhcyBhcnJheVxuICAgICAgICBvdXRwdXQgPSB0ZW1wbGF0ZVsoY29udGVudCBpbnN0YW5jZW9mIEFycmF5KSA/IFwicGFyc2VBcnJheVwiIDogXCJwYXJzZVwiXShjb250ZW50KTtcblxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuXG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VmlldyA9IGZ1bmN0aW9uKHZJZCkge1xuICAgICAgICBpZiggIWRlZihzZWxmLnZpZXdzW3ZJZF0pICkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiS2Fya2FzSlM6IFJlcXVlc3RlZCB0ZW1wbGF0ZSBpcyBub3QgZGVmaW5lZDogJ1wiK3ZJZCtcIidcIik7XG4gICAgICAgIHJldHVybiBzZWxmLnZpZXdzW3ZJZF07XG4gICAgfTtcblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgS2Fya2FzKCk7XG59OyIsIi8qKlxuICogS2Fya2FzLmpzIChodHRwczovL2dpdGh1Yi5jb20vb2RpbjMva2Fya2FzKVxuICogTGljZW5zZWQgYnkgTUlUIGxpY2Vuc2VcbiAqXG4gKiBAcGFja2FnZSBrYXJrYXMuZG9tXG4gKiBAdmVyc2lvbiAzLjAuMC1iMVxuICogQGF1dGhvciBEZW5pcyBTZWRjaGVua29cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGthcmthcykge1xuICAgIGZ1bmN0aW9uIGRlZihlKSB7IHJldHVybiB0eXBlb2YgZSAhPT0gJ3VuZGVmaW5lZCc7IH1cbiAgICBmdW5jdGlvbiBudWwoZSkgeyByZXR1cm4gZSA9PT0gbnVsbCB9XG5cbiAgICBpZiggIWRlZih3aW5kb3cpICkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdLYXJrYXMgRE9NIGV4dGVuc2lvbnMgcmVxdXJpZXMgYnJvd3NlcicpO1xuICAgIGlmKCAhZGVmKHdpbmRvdy5kb2N1bWVudCkgKSB0aHJvdyBuZXcgRXJyb3IoJ0thcmthcyBET00gZXh0ZW5zaW9ucyByZXF1aXJlcyBhIGRvY3VtZW50IG9iamVjdCcpO1xuXG4gICAgdmFyICRkID0gd2luZG93LmRvY3VtZW50O1xuICAgIHZhciAkYiA9ICRkLnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIHZhciBDT01QSUxFRF9FTEVNRU5UX1NFTEVDVE9SICAgPSAnKltkYXRhLWNvbXBpbGVdJyxcbiAgICAgICAgQ09NUElMRURfRUxFTUVOVF9EQVRBICAgICAgID0gJ2RhdGEtY29tcGlsZScsXG4gICAgICAgIENPTVBJTEVEX0VMRU1FTlRfVEVNUExBVEUgICA9ICdkYXRhLXZpZXcnLFxuICAgICAgICBWSUVXX1NDUklQVF9NSU1FX1RZUEUgICAgICAgPSAndGV4dC9rYXJrYXMnO1xuXG4gICAga2Fya2FzLm9uRmluZCA9IGZ1bmN0aW9uKCkge307XG5cbiAgICBrYXJrYXMuY29tcGlsZUVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciB0ZW1wTmFtZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKENPTVBJTEVEX0VMRU1FTlRfVEVNUExBVEUpLFxuICAgICAgICAgICAgdGVtcERhdGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShDT01QSUxFRF9FTEVNRU5UX0RBVEEpO1xuXG4gICAgICAgIGlmKCBudWwodGVtcE5hbWUpICkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKENPTVBJTEVEX0VMRU1FTlRfVEVNUExBVEUrJyBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgaWYoIG51bCh0ZW1wRGF0YSkgKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoQ09NUElMRURfRUxFTUVOVF9EQVRBKycgaXMgdW5kZWZpbmVkJyk7XG5cbiAgICAgICAgdGVtcE5hbWUgPSB0ZW1wTmFtZS50cmltKCk7XG4gICAgICAgIHRlbXBEYXRhID0gdGVtcERhdGEudHJpbSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0ZW1wRGF0YSA9IEpTT04ucGFyc2UodGVtcERhdGEpO1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgKz0ga2Fya2FzLmNvbXBpbGUodGVtcE5hbWUsIHRlbXBEYXRhKTtcbiAgICAgICAgfSBjYXRjaChleCkge1xuICAgICAgICAgICAga2Fya2FzLmxvZyhcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdLYXJrYXM6IGZhaWxlZCB0byBjb21waWxlIGVsZW1lbnQnLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogICBleCxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudFxuICAgICAgICAgICAgICAgIH0sICdlcnJvcicpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAga2Fya2FzLnJlZnJlc2ggPSBmdW5jdGlvbihyZWZyZXNoSXRlbXMpIHtcbiAgICAgICAgLy8gVmlld3MgY29udGFpbmVyXG4gICAgICAgIGlmKHJlZnJlc2hJdGVtcykgdGhpcy5jbGVhcigpO1xuXG4gICAgICAgIHZhciB0ZW1wbGF0ZVNlbGVjdG9yID0gJ3NjcmlwdFt0eXBlPVwiJytWSUVXX1NDUklQVF9NSU1FX1RZUEUrJ1wiXSc7XG4gICAgICAgIGlmKCFyZWZyZXNoSXRlbXMpIHRlbXBsYXRlU2VsZWN0b3IgKz0gJzpub3QoW2RhdGEtbG9hZGVkXSknO1xuXG4gICAgICAgIC8vIFNlbGVjdCBhbGwgdGVtcGxhdGVzXG4gICAgICAgIHZhciB3ID0gJGQucXVlcnlTZWxlY3RvckFsbCh0ZW1wbGF0ZVNlbGVjdG9yKTtcblxuICAgICAgICAvLyBHcmVwIGFsbCBlbGVtZW50c1xuICAgICAgICBmb3IodmFyIGMgPSAwOyAgYyA8IHcubGVuZ3RoOyBjKysgKVxuICAgICAgICB7XG4gICAgICAgICAgICAoIG5ldyBrYXJrYXMuVmlldyh3W2NdLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksIHdbY10uaW5uZXJIVE1MKSApLmFwcGx5KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaW5kIGl0ZW1zIGJ5IGF0dHIgYW5kIHBhcnNlIHRoZW1cbiAgICAgICAgdmFyIHJlcXVlc3RlZFRvUGFyc2UgPSAkZC5xdWVyeVNlbGVjdG9yQWxsKENPTVBJTEVEX0VMRU1FTlRfU0VMRUNUT1IpO1xuXG4gICAgICAgIGlmKCFyZXF1ZXN0ZWRUb1BhcnNlLmxlbmd0aCkgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHJlcXVlc3RlZFRvUGFyc2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGthcmthcy5jb21waWxlRWxlbWVudChyZXF1ZXN0ZWRUb1BhcnNlW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiB0aGlzLm9uRmluZCA9PSAnZnVuY3Rpb24nKSB0aGlzLm9uRmluZCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbXBvcnQgY29udGVudCBhcyB0ZW1wbGF0ZSBmcm9tIHJlbW90ZSBVUkxcbiAgICAgKiBAcGFyYW0gdXJsIHtTdHJpbmd9IFVSTCBQYXRoXG4gICAgICogQHBhcmFtIHRlbXBsYXRlTmFtZSB7U3RyaW5nfSBUZW1wbGF0ZSBuYW1lXG4gICAgICogQHBhcmFtIHN1Y2Nlc3NDYWxsYmFjayB7RnVuY3Rpb259IG9uU3VjY2VzcyBjYWxsYmFja1xuICAgICAqL1xuICAgIGthcmthcy5pbmNsdWRlID0gZnVuY3Rpb24odXJsLCB0ZW1wbGF0ZU5hbWUsIHN1Y2Nlc3NDYWxsYmFjaykge1xuXG4gICAgICAgIGZ1bmN0aW9uIG1ha2VSZXF1ZXN0KG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgICBvbkVycm9yID0gb25FcnJvciB8fCBmdW5jdGlvbihlKSB7IGNvbnNvbGUuZXJyb3IoZSk7fTtcblxuICAgICAgICAgICAgeGhyLm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IG5ldyBrYXJrYXMuVmlldyh0ZW1wbGF0ZU5hbWUsIHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlLmFwcGx5KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHRlbXBsYXRlLCB4aHIucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIGRlZihvbkVycm9yKSApIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignS2Fya2FzOiBGYWlsZWQgdG8gaW1wb3J0IHJlbW90ZSB0ZW1wbGF0ZTogJyx7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgeGhyLnNlbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCB0eXBlb2YgdXJsICE9PSAnc3RyaW5nJyApIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignS2Fya2FzOiBVcmwgaXMgbm90IGEgU3RyaW5nJyk7XG4gICAgICAgIHRlbXBsYXRlTmFtZSA9IHRlbXBsYXRlTmFtZSB8fCB1cmw7XG4gICAgICAgIGlmKCAodHlwZW9mIHN1Y2Nlc3NDYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB8fCAhKCdQcm9taXNlJyBpbiB3aW5kb3cpICkgcmV0dXJuIG1ha2VSZXF1ZXN0KHN1Y2Nlc3NDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKG1ha2VSZXF1ZXN0KTtcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGthcmthcy5yZWZyZXNoKTtcblxufTsiLCIvKipcbiAqIEthcmthcy5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29kaW4zL2thcmthcylcbiAqIExpY2Vuc2VkIGJ5IE1JVCBsaWNlbnNlXG4gKlxuICogS2Fya2FzIGVtYmVkZGVkIGZpbHRlcnNcbiAqXG4gKiBAcGFja2FnZSBrYXJrYXMuZmlsdGVyc1xuICogQHZlcnNpb24gMy4wLjAtYjFcbiAqIEBhdXRob3IgRGVuaXMgU2VkY2hlbmtvXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2Fya2FzKSB7XG4gICAgd2l0aChrYXJrYXMuZmlsdGVycykge1xuICAgICAgICBhZGQoJ2N1cnJlbmN5JywgcmVxdWlyZSgnLi9maWx0ZXJzL2N1cnJlbmN5LmpzJykgKTtcbiAgICAgICAgYWRkKCdzdHJpbmcnLCByZXF1aXJlKCcuL2ZpbHRlcnMvc3RyaW5nLmpzJykgKTtcbiAgICAgICAgYWRkKCdhcnJheScsIHJlcXVpcmUoJy4vZmlsdGVycy9hcnJheS5qcycpICk7XG4gICAgICAgIGFkZCgnbWF0aCcsIHJlcXVpcmUoJy4vZmlsdGVycy9tYXRoLmpzJykgKTtcbiAgICAgICAgYWRkKCdqc29uJywgcmVxdWlyZSgnLi9maWx0ZXJzL2pzb24uanMnKSApO1xuICAgICAgICBhZGQoJ2NhcGl0YWxpemUnLCByZXF1aXJlKCcuL2ZpbHRlcnMvY2FwaXRhbGl6ZS5qcycpICk7XG4gICAgICAgIGFkZCgndG9Mb3dlcicsIHJlcXVpcmUoJy4vZmlsdGVycy90b0xvd2VyLmpzJykgKTtcbiAgICAgICAgYWRkKCd0b1VwcGVyJywgcmVxdWlyZSgnLi9maWx0ZXJzL3RvVXBwZXIuanMnKSApO1xuICAgIH1cblxufTsiLCIvKipcbiAqIEthcmthcy5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29kaW4zL2thcmthcylcbiAqIExpY2Vuc2VkIGJ5IE1JVCBsaWNlbnNlXG4gKlxuICogQXJyYXkgZmlsdGVyXG4gKlxuICogQHBhY2thZ2Uga2Fya2FzLmZpbHRlcnMuYXJyYXlcbiAqIEB2ZXJzaW9uIDMuMC4wLWIxXG4gKiBAYXV0aG9yIERlbmlzIFNlZGNoZW5rb1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHZhbHVlLCAkb3BlcmF0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyICRhcmdzID0gW10uc3BsaWNlLmFwcGx5KGFyZ3VtZW50cyxbMl0pO1xuICAgICAgICByZXR1cm4gKFtdKVskb3BlcmF0aW9uXS5hcHBseSgkdmFsdWUsJGFyZ3MpO1xuICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHBlcmZvcm0gbWV0aG9kIGBBcnJheS5cIiskb3BlcmF0aW9uK1wiYCAoXCIrZXgubWVzc2FnZStcIilcIik7XG4gICAgfVxufTsiLCIvKipcbiAqIEthcmthcy5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29kaW4zL2thcmthcylcbiAqIExpY2Vuc2VkIGJ5IE1JVCBsaWNlbnNlXG4gKlxuICogQHBhY2thZ2Uga2Fya2FzLmZpbHRlcnMuY2FwaXRhbGl6ZVxuICogQHZlcnNpb24gMy4wLjAtYjFcbiAqIEBhdXRob3IgRGVuaXMgU2VkY2hlbmtvXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB2YWwgPSBTdHJpbmcodmFsKTtcbiAgICByZXR1cm4gdmFsLnN1YnN0cmluZygwLDEpLnRvVXBwZXJDYXNlKCkrdmFsLnN1YnN0cmluZygxKTtcbn07IiwiLyoqXG4gKiBLYXJrYXMuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9vZGluMy9rYXJrYXMpXG4gKiBMaWNlbnNlZCBieSBNSVQgbGljZW5zZVxuICpcbiAqIEN1cnJlbmN5IGZpbHRlclxuICogXG4gKiBAcGFja2FnZSBrYXJrYXMuZmlsdGVycy5jdXJyZW5jeVxuICogQHZlcnNpb24gMy4wLjAtYjFcbiAqIEBhdXRob3IgRGVuaXMgU2VkY2hlbmtvXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkdmFsdWUsICRjdXJyZW5jeSwgJGRpZ2l0c1RvRml4ZWQpIHtcbiAgICAvLyBDdXJyZW5jeSBieSBkZWZhdWx0IGlzIFVTRFxuICAgICRjdXJyZW5jeSA9ICRjdXJyZW5jeSB8fCBcIiRcIjtcblxuXG4gICAgZnVuY3Rpb24gZm9ybWF0TW9uZXkobiwgYywgZCwgdCl7XG4gICAgICAgIHZhciBjID0gaXNOYU4oYyA9IE1hdGguYWJzKGMpKSA/IDIgOiBjLFxuICAgICAgICAgICAgZCA9IGQgPT0gdW5kZWZpbmVkID8gXCIuXCIgOiBkLFxuICAgICAgICAgICAgdCA9IHQgPT0gdW5kZWZpbmVkID8gXCIsXCIgOiB0LFxuICAgICAgICAgICAgcyA9IG4gPCAwID8gXCItXCIgOiBcIlwiLFxuICAgICAgICAgICAgaSA9IHBhcnNlSW50KG4gPSBNYXRoLmFicygrbiB8fCAwKS50b0ZpeGVkKGMpKSArIFwiXCIsXG4gICAgICAgICAgICBqID0gKGogPSBpLmxlbmd0aCkgPiAzID8gaiAlIDMgOiAwO1xuICAgICAgICByZXR1cm4gcyArIChqID8gaS5zdWJzdHIoMCwgaikgKyB0IDogXCJcIikgKyBpLnN1YnN0cihqKS5yZXBsYWNlKC8oXFxkezN9KSg/PVxcZCkvZywgXCIkMVwiICsgdCkgKyAoYyA/IGQgKyBNYXRoLmFicyhuIC0gaSkudG9GaXhlZChjKS5zbGljZSgyKSA6IFwiXCIpO1xuICAgIH1cblxuICAgIHJldHVybiAkY3VycmVuY3krXCIgXCIrZm9ybWF0TW9uZXkoJHZhbHVlLCAkZGlnaXRzVG9GaXhlZCk7XG5cblxufTsiLCIvKipcbiAqIEthcmthcy5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29kaW4zL2thcmthcylcbiAqIExpY2Vuc2VkIGJ5IE1JVCBsaWNlbnNlXG4gKlxuICogSlNPTiBmaWx0ZXJcbiAqXG4gKiBAcGFja2FnZSBrYXJrYXMuZmlsdGVycy5qc29uXG4gKiBAdmVyc2lvbiAzLjAuMC1iMVxuICogQGF1dGhvciBEZW5pcyBTZWRjaGVua29cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWwpO1xuICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG59OyIsIi8qKlxuICogS2Fya2FzLmpzIChodHRwczovL2dpdGh1Yi5jb20vb2RpbjMva2Fya2FzKVxuICogTGljZW5zZWQgYnkgTUlUIGxpY2Vuc2VcbiAqXG4gKiBNYXRoIGZpbHRlclxuICpcbiAqIEBwYWNrYWdlIGthcmthcy5maWx0ZXJzLm1hdGhcbiAqIEB2ZXJzaW9uIDMuMC4wLWIxXG4gKiBAYXV0aG9yIERlbmlzIFNlZGNoZW5rb1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHZhbHVlLCAkb3BlcmF0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgW10uc3BsaWNlLmFwcGx5KGFyZ3VtZW50cyxbMSwxXSk7XG4gICAgICAgIHJldHVybiBNYXRoWyRvcGVyYXRpb25dLmFwcGx5KE1hdGgsYXJndW1lbnRzKTtcbiAgICB9IGNhdGNoKGV4KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBwZXJmb3JtIG1ldGhvZCBgTWF0aC5cIiskb3BlcmF0aW9uK1wiYCAoXCIrZXgubWVzc2FnZStcIilcIik7XG4gICAgfVxufTsiLCIvKipcbiAqIEthcmthcy5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29kaW4zL2thcmthcylcbiAqIExpY2Vuc2VkIGJ5IE1JVCBsaWNlbnNlXG4gKlxuICogU3RyaW5nIGZpbHRlclxuICpcbiAqIEBwYWNrYWdlIGthcmthcy5maWx0ZXJzLnN0cmluZ1xuICogQHZlcnNpb24gMy4wLjAtYjFcbiAqIEBhdXRob3IgRGVuaXMgU2VkY2hlbmtvXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkdmFsdWUsICRvcGVyYXRpb24pIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgJGFyZ3MgPSBbXS5zcGxpY2UuYXBwbHkoYXJndW1lbnRzLFsyXSk7XG4gICAgICAgIHJldHVybiBcIlwiWyRvcGVyYXRpb25dLmFwcGx5KCR2YWx1ZSwkYXJncyk7XG4gICAgfSBjYXRjaChleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gcGVyZm9ybSBtZXRob2QgYFN0cmluZy5cIiskb3BlcmF0aW9uK1wiYCAoXCIrZXgubWVzc2FnZStcIilcIik7XG4gICAgfVxufTsiLCIvKipcbiAqIEthcmthcy5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29kaW4zL2thcmthcylcbiAqIExpY2Vuc2VkIGJ5IE1JVCBsaWNlbnNlXG4gKlxuICogQHBhY2thZ2Uga2Fya2FzLmZpbHRlcnMudG9Mb3dlclxuICogQHZlcnNpb24gMy4wLjAtYjFcbiAqIEBhdXRob3IgRGVuaXMgU2VkY2hlbmtvXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gU3RyaW5nKHZhbCkudG9Mb3dlckNhc2UoKTtcbn07IiwiLyoqXG4gKiBLYXJrYXMuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9vZGluMy9rYXJrYXMpXG4gKiBMaWNlbnNlZCBieSBNSVQgbGljZW5zZVxuICpcbiAqIEBwYWNrYWdlIGthcmthcy5maWx0ZXJzLnRvVXBwZXJcbiAqIEB2ZXJzaW9uIDMuMC4wLWIxXG4gKiBAYXV0aG9yIERlbmlzIFNlZGNoZW5rb1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIFN0cmluZyh2YWwpLnRvVXBwZXJDYXNlKCk7XG59OyIsIi8qKlxuICogS2Fya2FzLmpzIChodHRwczovL2dpdGh1Yi5jb20vb2RpbjMva2Fya2FzKVxuICogTGljZW5zZWQgYnkgTUlUIGxpY2Vuc2VcbiAqXG4gKiBAcGFja2FnZSBrYXJrYXMudmlld1xuICogQHZlcnNpb24gMy4wLjAtYjFcbiAqIEBhdXRob3IgRGVuaXMgU2VkY2hlbmtvXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrYXJrYXMpIHtcbiAgICBmdW5jdGlvbiBkZWYoZWwpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBlbCAhPSAndW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICBrYXJrYXMuVmlldyA9IGZ1bmN0aW9uKG5hbWUsIGNvbnRlbnQpIHtcbiAgICAgIGlmKCFkZWYoY29udGVudCkpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIkthcmthcy5WaWV3OiB2aWV3RWxlbWVudCBpcyBub3QgZGVmaW5lZC5cIik7XG4gICAgICBpZih0eXBlb2YgY29udGVudCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignS2Fya2FzLlZpZXc6IFRlbXBsYXRlIGNvbnRlbnQgbXVzdCBiZSBhIHN0cmluZycpO1xuXG4gICAgICAvKipcbiAgICAgICAqIFBhdHRlcm4gZm9yIGV4cHJlc3Npb25zICgge3t2YWx1ZX19IClcbiAgICAgICAqL1xuICAgICAgdGhpcy5wYXR0ZXJuICAgID0gL1tcXHtcXHtdKC4qPylbXFx9XFx9XSsvZ2ltO1xuXG5cbiAgICAgIHRoaXMubmFtZSAgICAgICA9IG5hbWU7XG4gICAgICB0aGlzLmNvbnRlbnQgICAgPSBjb250ZW50LnRyaW0oKTtcblxuICAgICAgdmFyIHNlbGYgICAgICAgID0gdGhpcztcblxuICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKHJlcGxhY2VJZkV4aXN0cykge1xuICAgICAgICAgIHJlcGxhY2VJZkV4aXN0cyA9IHJlcGxhY2VJZkV4aXN0cyB8fCBmYWxzZTtcbiAgICAgICAgICBpZihrYXJrYXMuZXhpc3RzKHRoaXMubmFtZSkgJiYgIXJlcGxhY2VJZkV4aXN0cykge1xuICAgICAgICAgICAgICBrYXJrYXMubG9nKCdDYW5ub3QgYXBwbHkgbmV3IHRlbXBsYXRlLCBcIicrdGhpcy5uYW1lKydcIiBhbHJlYWR5IGV4aXN0cy4gVXNlIFwiYXBwbHkodHJ1ZSlcIiB0byBvdmVyd3JpdGUgaXQuJywgJ3dhcm4nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBrYXJrYXMudmlld3Nbc2VsZi5uYW1lXSA9IHRoaXM7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuXG5cbiAgICAgIC8qKlxuICAgICAgICogUGFyc2Ugc2luZ2xlIGV4cHJlc3Npb24gZnJvbSBvYmplY3RcbiAgICAgICAqIEBwYXJhbSAgIHtPYmplY3R9ICRfb2JqZWN0ICAgICBPYmplY3RcbiAgICAgICAqIEBwYXJhbSAgIHtTdHJpbmd9ICRfZXhwcmVzc2lvbiBFeHByZXNzaW9uXG4gICAgICAgKiBAcmV0dXJucyB7Kn0gVmFsdWVcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gcGFyc2VFeHByZXNzaW9uKCRfb2JqZWN0LCAkX2V4cHJlc3Npb24pIHtcbiAgICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCd3aXRoKHRoaXMpIHsgcmV0dXJuICcrJF9leHByZXNzaW9uKyc7IH0nKS5hcHBseSgkX29iamVjdCk7XG4gICAgICB9XG5cblxuICAgICAgLyoqXG4gICAgICAgKiBQYXJzZSBhbiBzaW5nbGUgb2JqZWN0IHVzaW5nIHRoZSB0ZW1wbGF0ZVxuICAgICAgICogQHBhcmFtIGZpZWxkcyBPYmplY3RcbiAgICAgICAqIEByZXR1cm5zIHsqfSBDb21waWxlZCBjb250ZW50XG4gICAgICAgKi9cbiAgICAgIHRoaXMucGFyc2UgICAgICA9IGZ1bmN0aW9uKGZpZWxkcykge1xuICAgICAgICAgIHZhciBzUmV0dXJuICAgID0gdGhpcy5jb250ZW50LnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgIHRwRmllbGRzICAgPSBzUmV0dXJuLm1hdGNoKHRoaXMucGF0dGVybik7XG5cbiAgICAgICAgICBmb3IodmFyIHBhdCBpbiB0cEZpZWxkcyl7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50RmllbGQgPSB0cEZpZWxkc1twYXRdO1xuICAgICAgICAgICAgICBpZih0eXBlb2YgY3VycmVudEZpZWxkID09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGN1cnJlbnRGaWVsZCA9PSBcIm51bWJlclwiKXtcbiAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBicmFja2V0cyBhbmQgZXh0cmFjdCBmaWx0ZXJzXG4gICAgICAgICAgICAgICAgICB2YXIga2V5ID0gY3VycmVudEZpZWxkLnJlcGxhY2UoXCJ7e1wiLFwiXCIpLnJlcGxhY2UoXCJ9fVwiLFwiXCIpLnRyaW0oKS5zcGxpdChcInxcIik7XG5cbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBmaWx0ZXJzIGFuZCBleHByZXNzaW9uc1xuICAgICAgICAgICAgICAgICAgdmFyIGZpbHRlciA9IChrZXkubGVuZ3RoID4gMSkgPyBrZXlba2V5Lmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAga2V5ID0ga2V5WzBdO1xuXG4gICAgICAgICAgICAgICAgICAvLyAgcmVwbGFjZSBleHByZXNzaW9uIHdpdGggb2JqZWN0XG4gICAgICAgICAgICAgICAgICB2YXIgbmV3VmFsO1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdWYWwgPSBwYXJzZUV4cHJlc3Npb24oZmllbGRzLCBrZXkpO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaChleCkge1xuICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIkthcmthczogZmFpbGVkIHRvIHBhcnNlIGV4cHJlc3Npb24gJ1wiK2tleStcIicgaW4gdGVtcGxhdGUgJ1wiK3RoaXMubmFtZStcIicuIFwiK2V4Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLy8gSWYgdmFsdWUgaXMgdW5kZWZpbmVkIC0gcmVwbGFjZSBpdFxuICAgICAgICAgICAgICAgICAgaWYoICFkZWYobmV3VmFsKSApIG5ld1ZhbCA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFVzZSBmaWx0ZXIgb3IgdGVtcGxhdGUgaWYgYXZhaWxhYmxlIGluIGV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgIGlmKCBkZWYoZmlsdGVyKSkgIG5ld1ZhbCA9IGthcmthc1soZGVmKGthcmthcy52aWV3c1tmaWx0ZXJdKSkgPyBcImNvbXBpbGVcIiA6IFwiZmlsdGVyXCJdKGZpbHRlciwgbmV3VmFsKTtcblxuICAgICAgICAgICAgICAgICAgc1JldHVybiA9IHNSZXR1cm4ucmVwbGFjZShjdXJyZW50RmllbGQsbmV3VmFsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc1JldHVybjtcbiAgICAgIH07XG5cblxuICAgICAgLyoqXG4gICAgICAgKiBQYXJzZSBhbiBhcnJheSBvZiBvYmplY3RzIHVzaW5nIHRoZSB0ZW1wbGF0ZVxuICAgICAgICogQHBhcmFtIGFyclxuICAgICAgICogQHJldHVybnMge3N0cmluZ30gQ29tcGlsZWQgY29udGVudFxuICAgICAgICovXG4gICAgICB0aGlzLnBhcnNlQXJyYXkgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICB2YXIgYyA9IFwiXCI7XG4gICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBjICs9IHRoaXMucGFyc2UoYXJyW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGM7XG4gICAgICB9O1xuXG4gIH07XG59OyJdfQ==
