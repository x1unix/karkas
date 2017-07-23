"use strict";
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */
Object.defineProperty(exports, "__esModule", { value: true });
var SEARCH_PATTERN = /[\{\{](.*?)[\}\}]+/gim;
var valueParserFactory = function (expressionName) {
    return new Function("with(this) { return " + expressionName + "; }");
};
var t = function (v, t) { return typeof v === t; };
var def = function (val) { return t(val, 'undefined'); };
var View = (function () {
    function View(handler, name, content) {
        if (content === void 0) { content = null; }
        this.handler = handler;
        this.name = null;
        this.content = null;
        if (typeof content !== 'string') {
            throw new ReferenceError('Karkas.View: Template content must be a string');
        }
        this.name = name;
        this.content = content.trim();
    }
    Object.defineProperty(View.prototype, "pattern", {
        get: function () {
            return SEARCH_PATTERN;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Parse single expression from object
     * @param   {Object} object     Object
     * @param   {String} expression Expression
     * @returns {*} Value
     */
    View.prototype.parseExpression = function (object, expression) {
        return valueParserFactory(expression).apply(object);
    };
    /**
     * Parse an single object using the template
     * @param fields Object
     * @returns {string} Compiled content
     */
    View.prototype.parse = function (fields) {
        var sReturn = this.content.toString(), tpFields = sReturn.match(this.pattern);
        for (var pat in tpFields) {
            var currentField = tpFields[pat];
            if (t(currentField, 'string') || t(currentField, 'number')) {
                // Remove brackets and extract filters
                var keys = currentField.replace('{{', '').replace('}}', '').trim().split('|');
                // Check for filters and expressions
                var filter = (keys.length > 1) ? keys[keys.length - 1] : undefined;
                var key = keys[0];
                //  replace expression with object
                var newVal = void 0;
                try {
                    newVal = this.parseExpression(fields, key);
                }
                catch (ex) {
                    throw new ReferenceError("Karkas: failed to parse expression '" + key + "' in template '" + this.name + "'. " + ex.message);
                }
                // If value is undefined - replace it
                if (!def(newVal))
                    newVal = '';
                // Use filter or template if available in expression
                if (def(filter))
                    newVal = this.handler[this.handler.views.has(filter) ? 'compile' : 'filter'](filter, newVal);
                sReturn = sReturn.replace(currentField, newVal);
            }
        }
        return sReturn;
    };
    ;
    /**
     * Parse an array of objects using the template
     * @param arr
     * @returns {string} Compiled content
     */
    View.prototype.parseArray = function (arr) {
        var _this = this;
        return arr.map(function (i) { return _this.parse(i); }).join();
    };
    ;
    return View;
}());
exports.View = View;
//# sourceMappingURL=view.js.map