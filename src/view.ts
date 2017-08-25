/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.1.0
 * @author Denis Sedchenko
 */

import { Karkas } from './karkas';

import { isArray } from 'lodash';

const SEARCH_PATTERN = /[\{\{](.*?)[\}\}]+/gim;

const valueParserFactory = (expressionName: string): Function => {
  return new Function(`with(this) { return ${expressionName}; }`);
}

const t = (v: any, t: string) => typeof v === t;

const def = (val: any) => !t(val, 'undefined');

export class View {

  public name: string = null;

  public content: string = null;

  public get pattern() {
    return SEARCH_PATTERN;
  }

  public constructor(private handler: Karkas, name: string = null, content: string = null) {
    if (typeof content !== 'string') {
      throw new ReferenceError('Karkas.View: Template content must be a string');
    }

    this.name = name;

    this.content = content.trim();
  }

  /**
   * Parse single expression from object
   * @param   {Object} object     Object
   * @param   {String} expression Expression
   * @returns {*} Value
   */
  private parseExpression(object: any, expression: string) {
      return valueParserFactory(expression).apply(object);
  }

  /**
   * Compile object using the template
   * @param source Source
   */
  compile(source: any = null): string {
    if (source instanceof Array) {
      return this.parseArray(source);
    } else {
      return this.parse(source);
    }
  }


  /**
   * Parse an single object using the template
   * @param fields Object
   * @returns {string} Compiled content
   */
  parse(fields: any): string {
      let sReturn    = this.content.toString(),
          tpFields   = sReturn.match(this.pattern);

      for (let pat in tpFields){
          let currentField = tpFields[pat];

          if(t(currentField, 'string') || t(currentField, 'number')){
            // Remove brackets and extract filters
            const keys = currentField.replace('{{','').replace('}}','').trim().split('|');

            // Check for filters and expressions
            // const filter = (keys.length > 1) ? keys[keys.length - 1] : undefined;
            const filters = (keys.length > 1) ? keys.slice(1) : undefined;
            const key = keys[0];

            //  replace expression with object
            let newVal = '';

            try {
                newVal = this.parseExpression(fields, key);
            } catch (ex) {
                throw new ReferenceError(`Karkas: failed to parse expression '${key}' in template '${this.name}'. ${ex.message}`);
            }

            // If value is undefined - replace it
            if (!def(newVal) ) newVal = '';


            // Use filter or template if available in expression
            if (isArray(filters)) {
              filters.forEach((filter) => newVal = this.handler.filter(filter, newVal));
            }

            sReturn = sReturn.replace(currentField, newVal);
          }
      }

      return sReturn;
  }


  /**
   * Parse an array of objects using the template
   * @param arr
   * @returns {string} Compiled content
   */
  public parseArray(arr: Array<any>): string {
      return arr.map((i) => this.parse(i)).join('');
  }

}
