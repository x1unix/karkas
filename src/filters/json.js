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

module.exports = function(val) {
    try {
        return JSON.stringify(val);
    } catch(ex) {
        return val;
    }
};