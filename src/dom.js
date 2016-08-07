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