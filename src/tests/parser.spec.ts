import karkas from '../index';
import { isObject } from 'lodash';

describe('Karkas', () => {
  const tplName = 'testView';

  beforeEach(() => {
    karkas.createView(tplName, 'This is {{foo}}');
  });

  it('should be able to register new templates', () => {
    expect(isObject(karkas.getView(tplName))).toBeTruthy();
  });

  it('should parse object key expressions', () => {
    const EXPECTED = 'This is bar';
    const GOT = karkas.compile(tplName, {foo: 'bar'});

    expect(GOT).toEqual(EXPECTED);
  });

  it('should parse "this" as current object reference', () => {
    const EXPECTED = 'Hello World!';
    const GOT = karkas.view('Hello {{this}}!').compile('World');

    expect(GOT).toEqual(EXPECTED);
  });

  it('should parse JavaScript expressions inside template', () => {
    const EXPECTED = '2+2=4';
    const GOT = karkas.view('2+2={{2 + 2}}').compile(null);

    expect(GOT).toEqual(EXPECTED);
  });

  it('should filter values throw filter', () => {
    const OBJ = {foo: 'bar', a: [1, '2', 3]};
    const EXPECTED = JSON.stringify(OBJ);
    const GOT = karkas.view('{{this|json}}').compile(OBJ);

    expect(GOT).toEqual(EXPECTED);
  });

  it('should support multiple filters pipeline', () => {

    karkas.addFilter('parseFloat', function(value: any, parseAsStr: boolean) {
      if (parseAsStr === true) {
        return parseFloat(value);
      }
    });

    const OBJ = '314e-2';
    const EXPECTED = karkas.getFilter('currency')(parseFloat(OBJ), '€');
    const GOT = karkas.view('{{this|parseFloat:true|currency:"€"}}').compile(OBJ);

    expect(GOT).toEqual(EXPECTED);
  });
});
