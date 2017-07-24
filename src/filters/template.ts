/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * Array filter
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */

export function templateFilter(value: any, templateName: string) {
  if (typeof templateName === 'undefined') {
    throw new ReferenceError('Template name is not defined');
  }

  try {
      const v = this.compile(templateName, value);
      console.log(value, templateName, v);
      return v;
  } catch (ex) {
      throw new Error(`Failed to compile template '${templateName}' (${ex.message})`);
  }
};
