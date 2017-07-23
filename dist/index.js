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
var karkas_1 = require("./karkas");
var karkas_dom_1 = require("./karkas-dom");
/**
 * Export suitable karkas version (DOM or common)
 */
var getInstance = function () {
    var instance = null;
    if (typeof window !== 'undefined') {
        if (typeof window['karkas'] === 'undefined') {
            instance = new karkas_dom_1.KarkasDOM();
            window['karkas'] = instance;
        }
        else {
            instance = window['karkas'];
        }
    }
    else {
        instance = new karkas_1.Karkas();
    }
    return instance;
};
var karkas = getInstance();
exports.default = karkas;
//# sourceMappingURL=index.js.map