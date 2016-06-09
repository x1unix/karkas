/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Math filter
 *
 * @package karkas.filters.math
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function($value, $operation) {
    try {
        [].splice.apply(arguments,[1,1]);
        return Math[$operation].apply(Math,arguments);
    } catch(ex) {
        throw new Error("Failed to perform method `Math."+$operation+"` ("+ex.message+")");
    }
};