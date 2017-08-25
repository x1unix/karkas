/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.1.0
 * @author Denis Sedchenko
 */
import { Karkas } from './karkas';
export declare class View {
    private handler;
    name: string;
    content: string;
    readonly pattern: RegExp;
    constructor(handler: Karkas, name?: string, content?: string);
    /**
     * Parse single expression from object
     * @param   {Object} object     Object
     * @param   {String} expression Expression
     * @returns {*} Value
     */
    private parseExpression(object, expression);
    /**
     * Compile object using the template
     * @param source Source
     */
    compile(source?: any): string;
    /**
     * Parse an single object using the template
     * @param fields Object
     * @returns {string} Compiled content
     */
    parse(fields: any): string;
    /**
     * Parse an array of objects using the template
     * @param arr
     * @returns {string} Compiled content
     */
    parseArray(arr: Array<any>): string;
}
