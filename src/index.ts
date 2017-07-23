/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */

import { Karkas } from './karkas';
import { KarkasDOM } from './karkas-dom';
import { injectDefaultFilters } from './filters';


/**
 * Export suitable karkas version (DOM or common)
 */
const getInstance = (): Karkas => {
  let instance = null;

  if (typeof window !== 'undefined') {

    if (typeof window['karkas'] === 'undefined') {
      instance = new KarkasDOM();
      window['karkas'] = instance;
    } else {
      instance = window['karkas'];
    }

  } else {
    instance = new Karkas();
  }

  // Add default filters
  injectDefaultFilters(instance);

  return instance;
}

const karkas = getInstance();

export default karkas;
