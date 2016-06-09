/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Karkas embedded filters
 *
 * @package karkas.filters
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */
module.exports = function(karkas) {
    with(karkas.filters) {
        add('currency', require('./filters/currency.js') );
        add('string', require('./filters/string.js') );
        add('array', require('./filters/array.js') );
        add('math', require('./filters/math.js') );
        add('json', require('./filters/json.js') );
        add('capitalize', require('./filters/capitalize.js') );
        add('toLower', require('./filters/toLower.js') );
        add('toUpper', require('./filters/toUpper.js') );
    }

};