"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var karkas_dom_1 = require("../karkas-dom");
describe('KarkasDOM', function () {
    it('should load DOM extensions in browser environment', function () {
        expect(index_1.default instanceof karkas_dom_1.KarkasDOM).toBeTruthy();
    });
});
//# sourceMappingURL=dom.spec.js.map