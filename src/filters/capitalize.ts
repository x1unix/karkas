/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.filters.capitalize
 * @version 4.0.0
 * @author Denis Sedchenko
 */

export function capitalizeFilter(val: string) {
    val = String(val);
    return val.substring(0,1).toUpperCase()+val.substring(1);
};
