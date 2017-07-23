"use strict";
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * JSON filter
 *
 * @package karkas.filters.json
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */
Object.defineProperty(exports, "__esModule", { value: true });
function jsonFilter(val) {
    try {
        return JSON.stringify(val);
    }
    catch (ex) {
        return val;
    }
}
exports.jsonFilter = jsonFilter;
;
//# sourceMappingURL=json.js.map