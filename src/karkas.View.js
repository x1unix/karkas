/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas.view
 * @version 3.0.0-b1
 * @author Denis Sedchenko
 */

module.exports = function(karkas) {
    function is_null(o) {
        return o == null;
    }
    function def(el) {
        return typeof el != 'undefined';
    }

    karkas.View = function(name, content) {
      if(!def(content)) throw new ReferenceError("Karkas.View: viewElement is not defined.");
      if(typeof content !== 'string') throw new ReferenceError('Karkas.View: Template content must be a string');

      /**
       * Pattern for expressions ( {{value}} )
       */
      this.pattern    = /[\{\{](.*?)[\}\}]+/gim;


      this.name       = name;
      this.content    = content.trim();

      var self        = this;

      this.apply = function(replaceIfExists) {
          replaceIfExists = replaceIfExists || false;
          if(karkas.exists(this.name) && !replaceIfExists) {
              karkas.log('Cannot apply new template, "'+this.name+'" already exists. Use "apply(true)" to overwrite it.', 'warn');
              return false;
          }
          karkas.views[self.name] = this;
          return true;
      };


      /**
       * Parse single expression from object
       * @param   {Object} $_object     Object
       * @param   {String} $_expression Expression
       * @returns {*} Value
       */
      function parseExpression($_object, $_expression) {
          return new Function('with(this) { return '+$_expression+'; }').apply($_object);
      }


      /**
       * Parse an single object using the template
       * @param fields Object
       * @returns {*} Compiled content
       */
      this.parse      = function(fields) {
          var sReturn    = this.content.toString(),
              tpFields   = sReturn.match(this.pattern);

          for(var pat in tpFields){
              var currentField = tpFields[pat];
              if(typeof currentField == "string" || typeof currentField == "number"){
                  // Remove brackets and extract filters
                  var key = currentField.replace("{{","").replace("}}","").trim().split("|");

                  // Check for filters and expressions
                  var filter = (key.length > 1) ? key[key.length - 1] : undefined;
                  key = key[0];

                  //  replace expression with object
                  var newVal;
                  try {
                      newVal = parseExpression(fields, key);
                  } catch(ex) {
                      throw new ReferenceError("Karkas: failed to parse expression '"+key+"' in template '"+this.name+"'. "+ex.message);
                  }
                  // If value is undefined - replace it
                  if( !def(newVal) ) newVal = "";

                  // Use filter or template if available in expression
                  if( def(filter))  newVal = karkas[(isset(karkas.views[filter])) ? "compile" : "filter"](filter, newVal);

                  sReturn = sReturn.replace(currentField,newVal);
              }
          }
          return sReturn;
      };


      /**
       * Parse an array of objects using the template
       * @param arr
       * @returns {string} Compiled content
       */
      this.parseArray = function(arr) {
          var c = "";
          for(var i = 0; i < arr.length; i++) {
              c += this.parse(arr[i]);
          }
          return c;
      };

  };
};