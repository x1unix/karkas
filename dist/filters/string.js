"use strict";
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * String filter
 *
 * @package karkas.filters.string
 * @version 4.0.0
 * @author Denis Sedchenko
 */
Object.defineProperty(exports, "__esModule", { value: true });
function stringFilter(value, operation) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    try {
        return String.prototype[operation].apply(value, args);
    }
    catch (ex) {
        throw new Error("Failed to perform method 'String." + operation + "' (" + ex.message + ")");
    }
}
exports.stringFilter = stringFilter;
;
//# sourceMappingURL=string.js.map