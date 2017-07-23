"use strict";
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Karkas embedded filters
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */
Object.defineProperty(exports, "__esModule", { value: true });
var array_1 = require("./array");
var capitalize_1 = require("./capitalize");
var currency_1 = require("./currency");
var json_1 = require("./json");
var math_1 = require("./math");
var string_1 = require("./string");
var toLower_1 = require("./toLower");
var toUpper_1 = require("./toUpper");
var array_2 = require("./array");
exports.arrayFilter = array_2.arrayFilter;
var capitalize_2 = require("./capitalize");
exports.capitalizeFilter = capitalize_2.capitalizeFilter;
var currency_2 = require("./currency");
exports.currencyFilter = currency_2.currencyFilter;
var json_2 = require("./json");
exports.jsonFilter = json_2.jsonFilter;
var math_2 = require("./math");
exports.mathFilter = math_2.mathFilter;
var string_2 = require("./string");
exports.stringFilter = string_2.stringFilter;
var toLower_2 = require("./toLower");
exports.toLowerFilter = toLower_2.toLowerFilter;
var toUpper_2 = require("./toUpper");
exports.toUpperFilter = toUpper_2.toUpperFilter;
/**
 * Inject default filters to current Karkas instance
 *
 * @export
 * @param {Karkas} karkasInstance
 */
function injectDefaultFilters(karkasInstance) {
    karkasInstance
        .addFilter('currency', currency_1.currencyFilter)
        .addFilter('string', string_1.stringFilter)
        .addFilter('array', array_1.arrayFilter)
        .addFilter('math', math_1.mathFilter)
        .addFilter('json', json_1.jsonFilter)
        .addFilter('capitalize', capitalize_1.capitalizeFilter)
        .addFilter('toLower', toLower_1.toLowerFilter)
        .addFilter('toUpper', toUpper_1.toUpperFilter);
}
exports.injectDefaultFilters = injectDefaultFilters;
;
//# sourceMappingURL=index.js.map