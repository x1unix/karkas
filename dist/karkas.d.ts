/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.1.0
 * @author Denis Sedchenko
 */
import { View } from './view';
export declare class Karkas {
    private _version;
    /**
     * List of views
     *
     * @memberof Karkas
     */
    views: Map<string, View>;
    /**
     * List of filters
     *
     * @memberof Karkas
     */
    filters: Map<string, Function>;
    readonly version: string;
    /**
     * Reset instance
     *
     * @memberof Karkas
     */
    dispose(): void;
    /**
     * Get view
     *
     * @param {string} templateName
     * @returns {string}
     * @memberof Karkas
     */
    getView(templateName: string): View;
    /**
     * Get filter
     *
     * @param {string} filterName
     * @returns {Function}
     * @memberof Karkas
     */
    getFilter(filterName: string): Function;
    /**
     * Apply filter on query expression
     *
     * @param {string} filterQuery
     * @param {*} value Target object
     * @returns {string}
     * @memberof Karkas
     */
    filter(filterQuery: string, value: any): string;
    /**
     * Compile template with content
     *
     * @param {string} templateName
     * @param {(Array<any> | any)} [context={}]
     * @returns
     * @memberof Karkas
     */
    compile(templateName: string, context?: Array<any> | any): string;
    /**
     * Create and inject new view
     *
     * @param {string} name
     * @param {string} template
     * @returns {View}
     * @memberof Karkas
     */
    createView(name: string, template: string): View;
    /**
     * Create new view instance
     *
     * @param {string} template Template content
     * @returns {View} Created view
     * @memberof Karkas
     */
    view(template: string, name?: string): View;
    /**
     * Add filter
     *
     * @param {string} name
     * @param {Function} filterFunc
     * @returns {Karkas}
     * @memberof Karkas
     */
    addFilter(name: string, filterFunc: Function): Karkas;
}
