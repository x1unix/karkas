/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.filters.capitalize
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(val) {
    val = String(val);
    return val.substring(0,1).toUpperCase()+val.substring(1);
};