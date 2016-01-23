/**
 * KarkasJS (https://github.com/odin3/karkasJS)
 * @author Denis Sedchenko
 * @version 2.1
 */
var karkas = {
    /*
     * Views container
     */
    views : [],

    version: "2.1",
    /**
     * Load all templates on the page into karkas
     */
    findAll: function() {
        this.views = [];
        if(document.querySelectorAll("template").length > 0) console.warn("KarkasJS: HTML element `template` is deprecated, use `script[type='template/karkas']` instead.");
        var w = document.querySelectorAll("template, script[type='template/karkas']");
        for(var c = 0;  c < w.length; c++ )
        {
            this.views[w[c].getAttribute("name")] = new karkasView(w[c]);
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
        if(content instanceof Array) {
            output = template.parseArray(content);
        } else {
            output = template.parse(content);
        }

        // if target is false, return value
        if(target == false) return output;

        // == jQuery Support ==
        // Check if we have jQuery installed, and jQuery object is not empty
        if((typeof jQuery !== "undefined") && target instanceof jQuery))) {
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
        if(typeof karkas.views[vId] == "undefined") throw new ReferenceError("[KarkasView] Requested template is not defined: '"+vId+"'");
        return karkas.views[vId];
    }

};

/**
 * Karkas view class
 * @param viewElement name of view
 */
var karkasView = function(viewElement) {
    this.name = viewElement.getAttribute("name") || "";
    this.selector = "template[name='"+this.name+"']";
    this.element = viewElement;
};
karkasView.prototype = {
    pattern:/[{{](\S*)[}}]+/gim,

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

        for(var pat in tpFields){
            if(typeof tpFields[pat] == "string" || typeof tpFields[pat] == "number"){
                var key = tpFields[pat].replace("{{","").replace("}}","");
                var newVal =  "";

                if(key == "this" && typeof fields != "object") {
                    newVal = fields;
                } else {
                    if(typeof fields[key] != "undefined") newVal = fields[key.toString()].toString();
                }

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
    document.createElement("template");
    document.createElement("karkas");
    var css = 'template,karkas{display: none;}',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));

    head.appendChild(style);

    karkas.findAll();
})();
