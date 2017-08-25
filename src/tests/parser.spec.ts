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
    karkas.createView('thisTest', 'Hello {{this}}!');

    const EXPECTED = 'Hello World!';
    const GOT = karkas.compile('thisTest', 'World');

    expect(GOT).toEqual(EXPECTED);
  });

  it('should parse JavaScript expressions inside template', () => {
    karkas.createView('expTest', '2+2={{2 + 2}}');

    const EXPECTED = '2+2=4';
    const GOT = karkas.compile('expTest', null);

    expect(GOT).toEqual(EXPECTED);
  });

  it('should filter values throw filter', () => {
    karkas.createView('filterTest', '{{this|json}}');

    const OBJ = {foo: 'bar', a: [1, '2', 3]};
    const EXPECTED = JSON.stringify(OBJ);
    const GOT = karkas.compile('filterTest', OBJ);

    expect(GOT).toEqual(EXPECTED);
  });

  it('should support multiple filters pipeline', () => {

    karkas.addFilter('parseFloat', function(value: any, parseAsStr: boolean) {
      if (parseAsStr === true) {
        return parseFloat(value);
      }
    });

    karkas.createView('pipelineTest', '{{this|parseFloat:true|currency:"€"}}');

    const OBJ = '314e-2';
    const EXPECTED = karkas.getFilter('currency')(parseFloat(OBJ), '€');
    const GOT = karkas.compile('pipelineTest', OBJ);

    expect(GOT).toEqual(EXPECTED);
  });
});
