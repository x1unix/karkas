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

import { arrayFilter } from './array';
import { capitalizeFilter } from './capitalize';
import { currencyFilter } from './currency';
import { jsonFilter } from './json';
import { mathFilter } from './math';
import { stringFilter } from './string';
import { toLowerFilter } from './toLower';
import { toUpperFilter } from './toUpper';


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
export function injectDefaultFilters(karkasInstance: Karkas) {
    karkasInstance
       .addFilter('currency', currencyFilter)
       .addFilter('string', stringFilter)
       .addFilter('array', arrayFilter)
       .addFilter('math', mathFilter)
       .addFilter('json', jsonFilter)
       .addFilter('capitalize', capitalizeFilter)
       .addFilter('toLower', toLowerFilter)
       .addFilter('toUpper', toUpperFilter);
    }

};
