/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */
import { Karkas } from './karkas';
export declare class KarkasDOM extends Karkas {
    constructor();
    onFind(): void;
    /**
     * Process single DOM element
     *
     * @private
     * @param {(Element | HTMLElement)} element
     * @memberof KarkasDOM
     */
    private compileElement(element);
    /**
     * Re-start DOM check
     *
     * @param {boolean} [refreshItems=true]
     * @returns
     * @memberof KarkasDOM
     */
    refresh(refreshItems?: boolean): boolean;
    /**
     * Load template from external resource
     *
     * @param {string} url Resource URL
     * @param {string} templateName Template name
     * @param {Function} [successCallback=null] Callback function (if not defined, Promise will be returned)
     * @returns {(Promise<string> | void)}
     * @memberof KarkasDOM
     */
    include(url: string, templateName: string, successCallback?: Function): Promise<string> | void;
}
