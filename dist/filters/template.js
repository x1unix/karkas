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
function templateFilter(value, templateName) {
    if (typeof templateName === 'undefined') {
        throw new ReferenceError('Template name is not defined');
    }
    try {
        var v = this.compile(templateName, value);
        return v;
    }
    catch (ex) {
        throw new Error("Failed to compile template '" + templateName + "' (" + ex.message + ")");
    }
}
exports.templateFilter = templateFilter;
;
//# sourceMappingURL=template.js.map