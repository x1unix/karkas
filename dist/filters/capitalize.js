"use strict";
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.filters.capitalize
 * @version 4.0.0
 * @author Denis Sedchenko
 */
Object.defineProperty(exports, "__esModule", { value: true });
function capitalizeFilter(val) {
    val = String(val);
    return val.substring(0, 1).toUpperCase() + val.substring(1);
}
exports.capitalizeFilter = capitalizeFilter;
;
//# sourceMappingURL=capitalize.js.map