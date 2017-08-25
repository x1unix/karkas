import karkas from '../index';
import { KarkasDOM } from '../karkas-dom';
import { isObject } from 'lodash';

describe('KarkasDOM', () => {
  it('should load DOM extensions in browser environment', () => {
    expect(karkas instanceof KarkasDOM).toBeTruthy();
  });
})
