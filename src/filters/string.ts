/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * String filter
 *
 * @package karkas.filters.string
 * @version 4.0.0
 * @author Denis Sedchenko
 */

export function stringFilter(value: string, operation: string, ...args: any[]) {
  try {
      return String.prototype[operation].apply(value, args);
  } catch(ex) {
      throw new Error(`Failed to perform method 'String.${operation}' (${ex.message})`);
  }
};
