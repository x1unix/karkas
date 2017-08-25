"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var lodash_1 = require("lodash");
describe('Karkas', function () {
    var tplName = 'testView';
    beforeEach(function () {
        index_1.default.createView(tplName, 'This is {{foo}}');
    });
    it('should be able to register new templates', function () {
        expect(lodash_1.isObject(index_1.default.getView(tplName))).toBeTruthy();
    });
    it('should parse object key expressions', function () {
        var EXPECTED = 'This is bar';
        var GOT = index_1.default.compile(tplName, { foo: 'bar' });
        expect(GOT).toEqual(EXPECTED);
    });
    it('should parse "this" as current object reference', function () {
        var EXPECTED = 'Hello World!';
        var GOT = index_1.default.view('Hello {{this}}!').compile('World');
        expect(GOT).toEqual(EXPECTED);
    });
    it('should parse JavaScript expressions inside template', function () {
        var EXPECTED = '2+2=4';
        var GOT = index_1.default.view('2+2={{2 + 2}}').compile(null);
        expect(GOT).toEqual(EXPECTED);
    });
    it('should filter values throw filter', function () {
        var OBJ = { foo: 'bar', a: [1, '2', 3] };
        var EXPECTED = JSON.stringify(OBJ);
        var GOT = index_1.default.view('{{this|json}}').compile(OBJ);
        expect(GOT).toEqual(EXPECTED);
    });
    it('should support multiple filters pipeline', function () {
        index_1.default.addFilter('parseFloat', function (value, parseAsStr) {
            if (parseAsStr === true) {
                return parseFloat(value);
            }
        });
        var OBJ = '314e-2';
        var EXPECTED = index_1.default.getFilter('currency')(parseFloat(OBJ), '€');
        var GOT = index_1.default.view('{{this|parseFloat:true|currency:"€"}}').compile(OBJ);
        expect(GOT).toEqual(EXPECTED);
    });
});
//# sourceMappingURL=parser.spec.js.map