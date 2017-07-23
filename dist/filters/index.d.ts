/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Karkas embedded filters
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */
import { Karkas } from '../karkas';
export { arrayFilter } from './array';
export { capitalizeFilter } from './capitalize';
export { currencyFilter } from './currency';
export { jsonFilter } from './json';
export { mathFilter } from './math';
export { stringFilter } from './string';
export { toLowerFilter } from './toLower';
export { toUpperFilter } from './toUpper';
/**
 * Inject default filters to current Karkas instance
 *
 * @export
 * @param {Karkas} karkasInstance
 */
export declare function injectDefaultFilters(karkasInstance: Karkas): void;
