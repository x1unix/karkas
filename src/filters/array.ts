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

export function arrayFilter($value: Array<any>, $operation: string) {
    try {
        var $args = [].splice.apply(arguments,[2]);
        return ([])[$operation].apply($value,$args);
    } catch(ex) {
        throw new Error("Failed to perform method `Array."+$operation+"` ("+ex.message+")");
    }
};
