/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 * 
 * @package karkas
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

/**
 * Call a new Karkas instance
 * @param useDomExtensions bool Include DOM extension
 * @returns {*}
 */
module.exports = function(useDom) {
   var karkas = require('./src/core.js')();
    if( useDom ) require('./src/dom.js')(karkas);
    return karkas;
};