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
var view_1 = require("./view");
var Karkas = (function () {
    function Karkas() {
        this._version = '4.0.0';
        /**
         * List of views
         *
         * @memberof Karkas
         */
        this.views = new Map();
        /**
         * List of filters
         *
         * @memberof Karkas
         */
        this.filters = new Map();
    }
    Object.defineProperty(Karkas.prototype, "version", {
        get: function () {
            return this._version;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Reset instance
     *
     * @memberof Karkas
     */
    Karkas.prototype.dispose = function () {
        this.views.clear();
    };
    /**
     * Get view
     *
     * @param {string} templateName
     * @returns {string}
     * @memberof Karkas
     */
    Karkas.prototype.getView = function (templateName) {
        if (this.views.has(templateName)) {
            throw new ReferenceError("Karkas: View '" + templateName + "' is not defined");
        }
        return this.views.get(templateName);
    };
    /**
     * Get filter
     *
     * @param {string} filterName
     * @returns {Function}
     * @memberof Karkas
     */
    Karkas.prototype.getFilter = function (filterName) {
        if (this.filters.has(filterName)) {
            throw new ReferenceError("Karkas: Filter '" + filterName + "' is not defined");
        }
        return this.filters.get(filterName);
    };
    /**
     * Apply filter on query expression
     *
     * @param {string} filterQuery
     * @param {*} value Target object
     * @returns {string}
     * @memberof Karkas
     */
    Karkas.prototype.filter = function (filterQuery, value) {
        // Extract filter name and args
        var query = filterQuery.trim().split(":");
        var filterName = filterQuery[0];
        // Array of arguments that we will push to the filter
        // At start there will be only expression value
        value = [value];
        // Try to find another args
        if (query.length > 1) {
            var filterArgs = (new Function("return [" + filterQuery[1].trim() + "]"))();
            value = value.concat(filterArgs);
        }
        if (this.filters.has(filterName)) {
            throw new ReferenceError("Karkas: filter '" + filterName + "' is not defined");
        }
        try {
            // Find and call the filter with selected args
            var filter = this.filters.get(filterName);
            return filter.apply(filter, value);
        }
        catch (ex) {
            throw new Error("Karkas: failed to apply filter '" + filterName + "', reason: " + ex.message);
        }
    };
    /**
     * Compile template with content
     *
     * @param {string} templateName
     * @param {(Array<any> | any)} [context={}]
     * @returns
     * @memberof Karkas
     */
    Karkas.prototype.compile = function (templateName, context) {
        if (context === void 0) { context = {}; }
        // Output buffer
        var template = this.getView(templateName);
        var output = '';
        if (context instanceof Array) {
            output = template.parseArray(context);
        }
        else {
            output = template.parse(context);
        }
        return output;
    };
    ;
    /**
     * Create a new prepared view instance and injects it
     *
     * @param {string} name
     * @param {string} template
     * @returns {View}
     * @memberof Karkas
     */
    Karkas.prototype.createView = function (name, template) {
        var view = new view_1.View(this, name, template);
        this.views.set(name, view);
        return view;
    };
    /**
     * Add filter
     *
     * @param {string} name
     * @param {Function} filterFunc
     * @returns {Karkas}
     * @memberof Karkas
     */
    Karkas.prototype.addFilter = function (name, filterFunc) {
        this.filters.set(name, filterFunc);
        return this;
    };
    return Karkas;
}());
exports.Karkas = Karkas;
//# sourceMappingURL=karkas.js.map