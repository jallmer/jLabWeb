module.exports = {
   startsWith: function(str, prefix) { // Not the right place for this function ... but for the time being ok.
      if (str.length < prefix.length)
         return false;
      for (var i = prefix.length - 1;
         (i >= 0) && (str[i] === prefix[i]); --i)
         continue;
      return i < 0;
   },

   escapeRegExp: function(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
   },

   replaceAll: function(str, find, replace) {
      var stringutils = require('./stringutils.js');
      return str.replace(new RegExp(stringutils.escapeRegExp(find), 'g'), replace);
   },
}
