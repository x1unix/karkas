/**
  * KarkasJS
  * @author Denis Sedchenko
  * @version 1.0.1
  */
var karkas = {
    /*
     * Views container
     */
    views : [],

    /*
     * Find all templates on page or refresh page container
     */ 
    findAll: function() {
        this.views = [];
        var w = document.querySelectorAll("template");
        for(var c = 0;  c < w.length; c++ )
        {
            this.views[w[c].getAttribute("name")] = new karkasView(w[c]);
        }
    },

    /*
     * Get template by name
     */
    getView: function(vId) {
        return karkas.views[vId];
    }

};

// Single karkas template class
var karkasView = function(viewElement) {
    this.name = viewElement.getAttribute("name") || "";
    this.selector = "template[name='"+this.name+"']";
    this.element = viewElement;
};
karkasView.prototype = {
    pattern:/[{{](\S*)[}}]+/gim,

    /*
     * Return's an template text
     */
    getContext : function() {
        return this.element.innerHTML;
    },
    /*
     * Parse a template with data
     */
    parse: function(fields) {
     var sReturn    = this.getContext(),
         tpFields   = sReturn.match(this.pattern);

        for(var pat in tpFields){
            if(typeof tpFields[pat] == "string"){
                var key = tpFields[pat].replace("{{","").replace("}}","");
                var newVal =  "";
                if(typeof fields[key] != "undefined") newVal = fields[key].toString();
                sReturn = sReturn.replace(tpFields[pat],newVal);
            }
        }
        return sReturn;
    },

    // Parse array of objects
    parseArray: function(arr) {
        var c = "";
        for(var i in arr) {
            c += this.parse(arr[i]);
        }
        return c;
    }
};

(function(){

     // Karkas init
    document.createElement("template");
    var css = '.template{display: none;}',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));

    head.appendChild(style);

    
karkas.findAll();
})();



