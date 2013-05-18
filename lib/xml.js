
var xml2js = require("xml2js");
var _ = require("lodash");

//xml parser helper, transformed to node callback style
exports.parse = function(str, callback) {
  var parser = new xml2js.Parser(xml2js.defaults["0.1"]);
  parser.on("end", function(xmlObj) {
    callback(null, xmlObj);
  });
  parser.on("error", function(err) {
    callback(err, null);
  });
  parser.parseString(str);
};

exports.parseEntries = function(str, callback) {
  exports.parse(str, function(err, xmlObj) {
    if(!xmlObj)
      return callback("No data", null);
    if(_.isArray(xmlObj.entry))
      return callback(null, xmlObj.entry);
    if(_.isPlainObject(xmlObj.entry))
      return callback(null, [xmlObj.entry]);
    return callback("Unkown data", null);
  });
};
