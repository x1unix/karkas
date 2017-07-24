"use strict";
/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Array filter
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */
Object.defineProperty(exports, "__esModule", { value: true });
function arrayFilter(value, operation) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    try {
        return ([])[operation].apply(value, args);
    }
    catch (ex) {
        throw new Error("Failed to perform method `Array." + operation + "` (" + ex.message + ")");
    }
}
exports.arrayFilter = arrayFilter;
;
//# sourceMappingURL=array.js.map