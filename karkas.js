/**
 * Karkas.JS (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @author Denis Sedchenko
 * @version 2.4.1
 */
var karkas = {
    
    version: "2.4.1",
    /*
     * Views container
     */
    views : [],
    
    
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
     * Settings
     */
    params: {
        /**
         * Start finding templates at DOM content loaded
         */
        autorun: true,
        /**
         *  Parse expressions as array keys or object fields
         */
        parseAsObject: false,

        /**
         * Will replace undefined properties with empty string
         */
        replaceUndefinedExpressions: true,
    },
    

    /**
     * Load all templates on the page into karkas
     */
    findAll: function() {
        // Views container
        this.views = [];

        // Select all templates
        var w = document.querySelectorAll("script[type='template/karkas']");

        // Grep all elements
        for(var c = 0;  c < w.length; c++ )
        {
            this.views[w[c].getAttribute("name")] = new KarkasView(w[c]);
        }
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

        if(typeof target == "string") target = document.querySelectorAll(target);
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
        if(document.querySelectorAll("karkas").length == 0){
            document.getElementsByTagName("body")[0].appendChild(document.createElement("karkas"));
        }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    document.querySelector("karkas").innerHTML += xhr.response;
                    karkas.findAll();
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
var KarkasView = function(viewElement) {
    if(viewElement.getAttribute("name") == null || viewElement.getAttribute("name").length == 0) {
        throw new ReferenceError("KarkasJS: Template element must have a name");
    } else {
        this.name = viewElement.getAttribute("name") || "";
        this.element = viewElement;
        this.selector = this.element.tagName.toLowerCase()+"[name='"+this.name+"']";
    }
    
};
KarkasView.prototype = {
    /**
     * Pattern for expressions ( {{value}} )
     */
    pattern: /[\{\{](.*?)[\}\}]+/gim,

    /**
     * Returns an HTML text of template
     * @returns {string|*|string|string|string|string}
     */
    getContext : function() {
        return this.element.innerHTML;
    },
    
    /**
     * Parse an single object using the template
     * @param fields Object
     * @returns {*} Compiled content
     */
    parse: function(fields) {
        var sReturn    = this.getContext(),
            tpFields   = sReturn.match(this.pattern);

        function isset(e) {
            return typeof e != "undefined";    
        }
        for(var pat in tpFields){
            console.log(tpFields[pat]);
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
    },

    /**
     * Parse an array of objects using the template
     * @param arr
     * @returns {string} Compiled content
     */
    parseArray: function(arr) {
        var c = "";
        for(var i = 0; i < arr.length; i++) {
            c += this.parse(arr[i]);
        }
        return c;
    }
};

(function(){
    // Register custom karkas elements and styles
    document.createElement("karkas");
    var css = "karkas{display: none;}",
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    if(karkas.params.autorun) karkas.findAll();
})();
