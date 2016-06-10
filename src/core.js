/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.core
 * @version 3.0.0-b4
 * @author Denis Sedchenko
 */
module.exports = function() {

    function def(el) {
        return typeof el != 'undefined';
    }

    var self = this;

    this.version = {
        'major': 2,
        'minor': 0,
        'patch': 0,
        'build': 6,
        'toString': function() {
            with(this) {
                return[major, minor, patch].join('.');
            }
        }
    };

    this.views = {};
    this.filters = {
        __container__: {},
        /**
         * Get Filter
         */
        get: function(filterName) {
            if(typeof this.__container__[filterName] == "undefined") throw new ReferenceError("Karkas: undefined filter or template: '"+filterName+"'");
            return this.__container__[filterName];
        },

        /**
         * Add filter
         */
        add: function(filterName, func) {
            this.__container__[filterName] = func;
        }

    };

    require('./view.js')(self);
    require('./filters.js')(self);

    this.getView = function(vId) {
        if(typeof self.views[vId] == "undefined") throw new ReferenceError("KarkasJS: Requested template is not defined: '"+vId+"'");
        return self.views[vId];
    };

    this.clear = function() {
        for(var i in self.views) {
            delete this.views[i];
        }
    };

    this.exists = function(templateName) {
        return def(this.views[templateName]);
    };

    this.log = function(msgTxt, msgType) {
        msgType = msgType || 'log';
        msgTxt  = "Karkas: "+msgTxt;
        return ( def(console) && def(console[msgType]) ) ? console[msgType](msgTxt) : null;
    };

    this.filter = function(filterQuery, value) {

        // Extract filter name and args
        filterQuery = filterQuery.trim().split(":");
        var filterName = filterQuery[0];

        // Array of arguments that we will push to the filter
        // At start there will be only expression value
        value = [value];

        // Try to find another args
        if(filterQuery.length > 1) {
            var filterArgs = (new Function("return ["+filterQuery[1].trim()+"]"))();
            value = value.concat(filterArgs);
        }

        try {
            // Find and call the filter with selected args
            var filter = self.filters.get(filterName);
            return filter.apply(filter,value);
        } catch(ex) {
            throw new Error("Karkas: failed to apply filter '"+filterName+"', reason: "+ex.message);
        }
    };

    this.compile = function(templateName, content) {

        // Output buffer
        var output   = "",
            template = self.getView(templateName);

        content = content || {};

        // If we have an array, parse as array
        output = template[(content instanceof Array) ? "parseArray" : "parse"](content);

        return output;

    };

    this.getView = function(vId) {
        if( !def(self.views[vId]) ) throw new ReferenceError("KarkasJS: Requested template is not defined: '"+vId+"'");
        return self.views[vId];
    };


};