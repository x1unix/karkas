/**
 * Karkas.JS (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @author Denis Sedchenko
 * @version 2.4.3
 */

(function($window, $document){
    var karkas = {
    
    version: "2.4.3",
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
        templateSourceSelector: "script[type='template/karkas']",
        
        /**
         *  Parse expressions as regular objects
         *  
         * false: Karkas will parse expression as associative
         *        array. (Recommended)
         *        
         * true:  Karkas will parse as objects (may cause errors)
         * 
         */
        parseAsObject: false,

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
            // var filterArgs = filterQuery[1].trim().split(",");
            // for(var c = 0; c < filterArgs.length; c++) {
            //     filterArgs[c] = filterArgs[c].trim();
            // }
            var filterArgs = eval("["+filterQuery[1].trim()+"]");
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
            currency: function($value, $currency) {
                // Currency by default is USD
                $currency = $currency || "$";
                
                var _valFloat = $value % 1,
                    _valInt   = parseInt($value);

                var output = _valInt + ".";

                // Format floating point numbers
                output += (_valFloat < 0.1) ? "0"+parseInt(_valFloat*100) : String((_valFloat * 100));
                
                return $currency+" "+output;
            },
            /**
             * String manipulation filter.
             * Calls a method for String class with args
             */
            string: function($value, $operation) {
                try {
                    var $args = [].splice.apply(arguments,[2]);
                    return ""[$operation].apply($value,$args);
                } catch(ex) {
                    throw new Error("Failed to perform method `String."+$operation+"` ("+ex.message+")");
                }
            },
            math: function($value, $operation) {
                try {
                    [].splice.apply(arguments,[1,1]);
                    return Math[$operation].apply(Math,arguments);
                } catch(ex) {
                    throw new Error("Failed to perform method `Math."+$operation+"` ("+ex.message+")");
                }
            },
            /**
             * JSON to string
             */
            json: function(val) {
                try {
                    return JSON.stringify(val);
                } catch(ex) {
                    return val; 
                }
            },
            toUpper: function(val) {
                return String(val).toUpperCase();
            },
            toLower: function(val) {
                return String(val).toLowerCase();
            },
            capitalize: function(val) {
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
        if(typeof this.onFind == 'function') this.onFind();
    },
    
    /**
     * Reload items (Deprecated, use 'refresh')
     */
    findAll: function(refreshItems) {
        return this.refresh(refreshItems);
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
     * @return promise
     */
    include: function(url) {
        return new Promise(function (resolve, reject) {
            var body  = $document.querySelector('body');
            if(!body) throw new Error('Karkas: body element is required in DOM');
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    body.innerHTML += xhr.response;
                    karkas.refresh();
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
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
 * @param viewElement name of view
 */
karkas.View = function(viewElement) {
    if(viewElement.getAttribute("name") == null || viewElement.getAttribute("name").length == 0) 
        throw new ReferenceError("KarkasJS: Template element must have a name");

    /**
     * Pattern for expressions ( {{value}} )
     */
    this.pattern    = /[\{\{](.*?)[\}\}]+/gim;
    
    
    this.name       = viewElement.getAttribute("name") || "";
    this.element    = (karkas.params.removeTemplatesFromDom) ? null : viewElement;
    
   var contextCache = (karkas.params.useTemplateCache) ? viewElement.innerHTML.trim() : null,
        self        = this,
        rmFromDom   = karkas.params.removeTemplatesFromDom,
        useCache    = karkas.params.useTemplateCache;
    
    
    if(rmFromDom) {
        // Remove element from DOM if feature is enabled
        viewElement.remove();
    } else {
        // Mark HTML element as loaded, to prevent double loading
        this.element.setAttribute('data-loaded','true');
    }
  
    /**
     * Returns an HTML of template
     * @returns {string}
     */
    this.getContext = function() {
        if(this.element == null || rmFromDom && useCache) return contextCache;
        
        return (useCache && (contextCache !== null) ) ? contextCache : this.element.innerHTML;
    };
    
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
                    newVal = (key == "this") ? fields : eval(
                        (karkas.params.parseAsObject) ? "fields."+key : "fields[\""+key.split(".").join("\"][\"")+"\"]"
                            );
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


})(window, document);


