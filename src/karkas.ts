/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */

 import { View } from './view';

 export class Karkas {
  private _version = '4.0.0';

  /**
   * List of views
   *
   * @memberof Karkas
   */
  public views = new Map<string, View>();

  /**
   * List of filters
   *
   * @memberof Karkas
   */
  public filters = new Map<string, Function>();

  public get version(): string {
    return this._version;
  }

  /**
   * Reset instance
   *
   * @memberof Karkas
   */
  public dispose() {
    this.views.clear();
  }

  /**
   * Get view
   *
   * @param {string} templateName
   * @returns {string}
   * @memberof Karkas
   */
  public getView(templateName: string): View {
    if (!this.views.has(templateName)) {
      throw new ReferenceError(`Karkas: View '${templateName}' is not defined`);
    }

    return this.views.get(templateName);
  }

  /**
   * Get filter
   *
   * @param {string} filterName
   * @returns {Function}
   * @memberof Karkas
   */
  public getFilter(filterName: string): Function {
    if (!this.filters.has(filterName)) {
      throw new ReferenceError(`Karkas: Filter '${filterName}' is not defined`);
    }

    return this.filters.get(filterName);
  }

  /**
   * Apply filter on query expression
   *
   * @param {string} filterQuery
   * @param {*} value Target object
   * @returns {string}
   * @memberof Karkas
   */
  public filter(filterQuery: string, value: any): string {
    // Extract filter name and args
    const query = filterQuery.trim().split(":");
    var filterName = query[0];

    // Array of arguments that we will push to the filter
    // At start there will be only expression value
    value = [value];

    // Try to find another args
    if (query.length > 1) {
        const filterArgs = (new Function(`return [${query[1].trim()}]`))();
        value = value.concat(filterArgs);
    }

    if (!this.filters.has(filterName)) {
      throw new ReferenceError(`Karkas: filter '${filterName}' is not defined`);
    }

    try {
      // Find and call the filter with selected args
      const filter = this.filters.get(filterName);
      return filter.apply(filter, value);
    } catch(ex) {
      throw new Error(`Karkas: failed to apply filter '${filterName}', reason: ${ex.message}`);
    }
  }

  /**
   * Compile template with content
   *
   * @param {string} templateName
   * @param {(Array<any> | any)} [context={}]
   * @returns
   * @memberof Karkas
   */
  public compile(templateName: string, context: Array<any> | any = {}): string {
    // Output buffer
    const template = this.getView(templateName);

    let output = '';

    if (context instanceof Array) {
      output = template.parseArray(context);
    } else {
      output = template.parse(context);
    }

    return output;
  };


  /**
   * Create a new prepared view instance and injects it
   *
   * @param {string} name
   * @param {string} template
   * @returns {View}
   * @memberof Karkas
   */
  public createView(name: string, template: string): View {
    const view = new View(this, name, template);

    this.views.set(
      name,
      view
    );

    return view;
  }

  /**
   * Add filter
   *
   * @param {string} name
   * @param {Function} filterFunc
   * @returns {Karkas}
   * @memberof Karkas
   */
  public addFilter(name: string, filterFunc: Function): Karkas {
    this.filters.set(name, filterFunc);
    return this;
  }
}
