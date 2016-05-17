/**
 * Karkas.JS (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @author Denis Sedchenko
 * @version 2.4.7
 */

(function($window, $document){

    function def(el) {
        return typeof el != 'undefined';
    }

    var karkas = {
    
    version: "2.4.7",
    /*
     * Views container
     */
    views : {},
    
    /**
     * Configuration
     */
    params: {
        /**
         * Start to find templates after page loaded
         *  
         * false: You have maunaly scan page for templates
         *        
         * true:  Karkas will grab all founed templates after DOM
         *        content loaded.
         */
        autorun: true,

        /**
         * Cache template content.
         * 
         * false: Karkas will read template's DOM HTML each time
         *        when you will compile a template.  
         *        
         * true:  Karkas will push HTML content to cache when
         *        template was discovered. (Recommended)
         */
        useTemplateCache: true,
        
        /**
         * Removes template element from HTML when template was found.
         * Works only if `useTemplateCache` is true.
         * 
         * false: Element will stay in DOM without changes.
         *        (Default)
         *        
         * true:  Karkas will remove element from DOM tree.
         */
        removeTemplatesFromDom: false,
        
        /**
         * Replace undefined properties with empty string
         * 
         * false: You will get `undefined` each time when
         *        requested value is undefined  
         *        
         * true:  Karkas will replace undefined values
         *        with empty strings (Recommended)
         */
        replaceUndefinedExpressions: true,
        
        /**
         * CSS selector that Karkas will use to search templates
         * 
         * Default: "script[type='template/karkas']"
         */
        templateSourceSelector: "script[type='template/karkas']"

    },
    /**
     * Internal logger
     * @param msgTxt
     * @param msgType
     * @returns {null}
     */
    log: function(msgTxt, msgType) {
      msgType = msgType || 'log';
      msgTxt  = "Karkas: "+msgTxt;
      return ( def($window.console) && def($window.console[msgType]) ) ? $window.console[msgType](msgTxt) : null;
    },
    /**
     * Parse filter expression for value
     */
    filter: function(filterQuery, value) {
        
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
            var filter = karkas.filters.get(filterName);
            return filter.apply(filter,value);
        } catch(ex) {
            throw new Error("Karkas: failed to apply filter '"+filterName+"', reason: "+ex.message);
        }
    },
    
    /**
     * Filters container
     */
    filters: {
        __container__:{
            /**
             * Currency filter
             */
            currency: function($value, $currency, $digitsToFixed) {
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
                
                
            },
            /**
             * String manipulation filter.
             * Calls a method for String class with args
             */
            'string': function($value, $operation) {
                try {
                    var $args = [].splice.apply(arguments,[2]);
                    return ""[$operation].apply($value,$args);
                } catch(ex) {
                    throw new Error("Failed to perform method `String."+$operation+"` ("+ex.message+")");
                }
            },
            'math': function($value, $operation) {
                try {
                    [].splice.apply(arguments,[1,1]);
                    return Math[$operation].apply(Math,arguments);
                } catch(ex) {
                    throw new Error("Failed to perform method `Math."+$operation+"` ("+ex.message+")");
                }
            },
            'array': function($value, $operation) {
                try {
                    var $args = [].splice.apply(arguments,[2]);
                    return ([])[$operation].apply($value,$args);
                } catch(ex) {
                    throw new Error("Failed to perform method `Array."+$operation+"` ("+ex.message+")");
                }
            },
            /**
             * JSON to string
             */
            'json': function(val) {
                try {
                    return JSON.stringify(val);
                } catch(ex) {
                    return val; 
                }
            },
            'toUpper': function(val) {
                return String(val).toUpperCase();
            },
            'toLower': function(val) {
                return String(val).toLowerCase();
            },
            'capitalize': function(val) {
                val = String(val);
                return val.substring(0,1).toUpperCase()+val.substring(1);
            }
        },
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
    },

    
    
    /**
     * Remove all views from Karkas
     */
    clear: function() {
        for(var i in this.views) {
            delete this.views[i];
        }
    },
    /**
     * Function called when Karkas is searching for elements
     */
    onFind: function() {},

    /**
     * Load all templates on the page into karkas
     */
    refresh: function(refreshItems) {
        // Views container
        if(refreshItems) this.clear();

        var templateSelector = String(this.params.templateSourceSelector);
        if(!refreshItems) templateSelector += ':not([data-loaded])';
        
        // Select all templates
        var w = $document.querySelectorAll(templateSelector);

        // Grep all elements
        for(var c = 0;  c < w.length; c++ )
        {
            this.views[w[c].getAttribute("name")] = new karkas.View(w[c]);
        }

        // find items by attr and parse them
        var requestedToParse = $document.querySelector('*['+this.params.elementsSelector+']');

        if(is_null(requestedToParse)) return true;

        for(var i = 0; i < requestedToParse.length; i++) {
            this.applyToElement(requestedToParse[i]);
        }

        if(typeof this.onFind == 'function') this.onFind();
    },

    
    /**
     * Reload items (Deprecated, use 'refresh')
     */
    findAll: function(refreshItems) {
        return this.refresh(refreshItems);
    },

    exists: function(templateName) {
     return def(this.views[templateName]);
    },
    

    /**
     * Compile a data using a specified template. Also can directly process output to HTML elements
     * @param templateName The name of selected template
     * @param content Object or array to proceed
     * @param target [optional] String, array or single HTML element
     * @param overwrite [optional] overwrite a content in HTML element
     * @returns string Compiled data
     */
    compile: function(templateName, content, target, overwrite) {

        // Output buffer
        var output   = "",
            template = this.getView(templateName);

        content = content || {};
        
        // If target is undefined, make it 'false'
        target = target || false;

        // if overwrite is undefined, it will be false
        overwrite = overwrite || false;

        // If we have an array, parse as array
        output = template[(content instanceof Array) ? "parseArray" : "parse"](content);

        // if target is false, return value
        if(target == false) return output;

        // == jQuery Support ==
        // Check if we have jQuery installed, and jQuery object is not empty
        if((typeof jQuery != "undefined") && target instanceof jQuery) {
            if(target.length > 0) {
                target = target.get(0);
            } else {
                return output;
            }

        }


        function karkas__pasteData(htmlElement){
            if(overwrite) {
                htmlElement.innerHTML = output;
            }else{
                htmlElement.innerHTML += output;
            }
            return output;
        }

        // if we have a single HTML object, work with it and break
        if(target instanceof HTMLElement) return karkas__pasteData(target);

        if(typeof target == "string") target = $document.querySelectorAll(target);
        for(var i = 0; i < target.length; i++){
            karkas__pasteData(target[i]);
        }

        return output;
    },

    /**
     * Load templates from remote URL
     * @param url URL
     * @param successCallback onSuccess callback
     */
    include: function(url, successCallback) {
        function makeRequest(onSuccess, onError) {
            var body  = $document.querySelector('body');
            if(!body) throw new Error('Karkas: body element is required in DOM');
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    body.innerHTML += xhr.response;
                    karkas.refresh();
                    onSuccess(xhr.response);
                } else {
                    onError({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                onError({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        }

        if( (typeof successCallback == 'function') || (typeof window.Promise == 'undefined') ) return makeRequest(successCallback);

        return new Promise(function (resolve, reject) {
            makeRequest(resolve, reject);
        });
    },
    /*
     * Get template by name
     */
    getView: function(vId) {
        if(typeof karkas.views[vId] == "undefined") throw new ReferenceError("KarkasJS: Requested template is not defined: '"+vId+"'");
        return karkas.views[vId];
    }

};

/**
 * Karkas view class
 * @param name template name (optional)
 * @param viewElement name of view
 */
karkas.View = function(viewElement, name) {
    if(!def(viewElement)) throw new ReferenceError("KarkasJS: karkas.View: viewElement is not defined.");

    // Check if view created from HTML element
    this.hasElement = (viewElement instanceof HTMLElement);


    if(!this.hasElement && !(typeof viewElement == 'string') )
        throw new TypeError("KarkasJS: View content can be only HTMLElement or String");

    // Extract template name
    if(this.hasElement) {
        if( !def(name) ) {
            if(viewElement.getAttribute("name") == null || viewElement.getAttribute("name").length == 0)
            {
                throw new ReferenceError("KarkasJS: Template element must have a name");
            } else {
                name = viewElement.getAttribute("name");
            }
        }

    }

    /**
     * Pattern for expressions ( {{value}} )
     */
    this.pattern    = /[\{\{](.*?)[\}\}]+/gim;
    
    
    this.name       = name;
    this.element    = (karkas.params.removeTemplatesFromDom || !this.hasElement) ? null : viewElement;
    
   var contextCache = null,
        self        = this,
        rmFromDom   = karkas.params.removeTemplatesFromDom,
        useCache    = karkas.params.useTemplateCache;

    if(this.hasElement) {
        contextCache = (karkas.params.useTemplateCache) ? viewElement.innerHTML.trim() : null;

        if(rmFromDom) {
            // Remove element from DOM if feature is enabled
            viewElement.remove();
        } else {
            // Mark HTML element as loaded, to prevent double loading
            this.element.setAttribute('data-loaded','true');
        }

    } else {
        contextCache = viewElement;
    }


  
    /**
     * Returns an HTML of template
     * @returns {string}
     */
    this.getContext = function() {
        if(this.element == null || rmFromDom && useCache) return contextCache;
        
        return (useCache && (contextCache !== null) ) ? contextCache : this.element.innerHTML;
    };

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
        var sReturn    = this.getContext(),
            tpFields   = sReturn.match(this.pattern);

        function isset(e) {
            return typeof e != "undefined";    
        }
        
        for(var pat in tpFields){
            if(typeof tpFields[pat] == "string" || typeof tpFields[pat] == "number"){
                // Remove brackets and extract filters
                var key = tpFields[pat].replace("{{","").replace("}}","").trim().split("|");

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
                if((!isset(newVal)) && (karkas.params.replaceUndefinedExpressions)) newVal = "";
                
                // Use filter or template if available in expression
                if(isset(filter)) newVal = karkas[(isset(karkas.views[filter])) ? "compile" : "filter"](filter, newVal);
                
                sReturn = sReturn.replace(tpFields[pat],newVal);
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

$window.karkas = karkas;

$document.addEventListener("DOMContentLoaded", function(){
    // Register custom karkas elements and styles
    if(karkas.params.autorun) karkas.refresh(true);


});
function is_null(o) {
    return o == null;
}


})(window, document);


