"use strict";
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var karkas_1 = require("./karkas");
function def(e) { return typeof e !== 'undefined'; }
function nul(e) { return e === null; }
var COMPILED_ELEMENT_SELECTOR = '*[data-compile]', COMPILED_ELEMENT_DATA = 'data-compile', COMPILED_ELEMENT_TEMPLATE = 'data-view', VIEW_SCRIPT_MIME_TYPE = 'text/karkas';
var DEF_ERR_CB = function (e) { return console.error(e); };
var KarkasDOM = (function (_super) {
    __extends(KarkasDOM, _super);
    function KarkasDOM() {
        var _this = _super.call(this) || this;
        if (!def(window))
            throw new ReferenceError('Karkas DOM extensions requries browser');
        if (!def(window.document))
            throw new Error('Karkas DOM extensions requires a document object');
        document.addEventListener('DOMContentLoaded', function () { return _this.refresh(); });
        return _this;
    }
    KarkasDOM.prototype.onFind = function () { };
    KarkasDOM.prototype.compileElement = function (element) {
        var tempName = element.getAttribute(COMPILED_ELEMENT_TEMPLATE), tempData = element.getAttribute(COMPILED_ELEMENT_DATA);
        if (nul(tempName))
            throw new ReferenceError(COMPILED_ELEMENT_TEMPLATE + ' is undefined');
        if (nul(tempData))
            throw new ReferenceError(COMPILED_ELEMENT_DATA + ' is undefined');
        tempName = tempName.trim();
        tempData = tempData.trim();
        try {
            tempData = JSON.parse(tempData);
            element.innerHTML += this.compile(tempName, tempData);
        }
        catch (ex) {
            console.error('Karkas: failed to compile element', {
                element: element,
                error: ex
            });
        }
    };
    KarkasDOM.prototype.refresh = function (refreshItems) {
        if (refreshItems === void 0) { refreshItems = true; }
        // Views container
        if (refreshItems)
            this.dispose();
        var templateSelector = "script[type=\"" + VIEW_SCRIPT_MIME_TYPE + "\"]";
        if (!refreshItems)
            templateSelector += ':not([data-loaded])';
        // Select all templates
        var w = document.querySelectorAll(templateSelector);
        // Grep all elements
        for (var c = 0; c < w.length; c++) {
            this.createView(w[c].getAttribute("name"), w[c].innerHTML);
        }
        // find items by attr and parse them
        var requestedToParse = document.querySelectorAll(COMPILED_ELEMENT_SELECTOR);
        if (!requestedToParse.length)
            return true;
        for (var i = 0; i < requestedToParse.length; i++) {
            this.compileElement(requestedToParse[i]);
        }
        if (typeof this.onFind === 'function') {
            this.onFind();
        }
    };
    ;
    KarkasDOM.prototype.include = function (url, templateName, successCallback) {
        if (successCallback === void 0) { successCallback = null; }
        function makeRequest(onSuccess, onError) {
            var _this = this;
            if (onError === void 0) { onError = DEF_ERR_CB; }
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    var template = _this.createView(templateName, xhr.response);
                    onSuccess(template, xhr.response);
                }
                else {
                    onError({
                        status: _this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                if (def(onError)) {
                    onError({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
                else {
                    console.error('Karkas: Failed to import remote template: ', {
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.send();
        }
        if (typeof url !== 'string')
            throw new ReferenceError('Karkas: Url is not a String');
        templateName = templateName || url;
        if ((typeof successCallback === 'function') || !('Promise' in window)) {
            return makeRequest(successCallback);
        }
        return new Promise(makeRequest);
    };
    ;
    return KarkasDOM;
}(karkas_1.Karkas));
exports.KarkasDOM = KarkasDOM;
//# sourceMappingURL=karkas-dom.js.map