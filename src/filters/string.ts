/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * String filter
 *
 * @package karkas.filters.string
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

export function stringFilter($value: string, $operation: string) {
    try {
        var $args = [].splice.apply(arguments,[2]);
        return ""[$operation].apply($value,$args);
    } catch(ex) {
        throw new Error("Failed to perform method `String."+$operation+"` ("+ex.message+")");
    }
};
