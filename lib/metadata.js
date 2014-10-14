var request = require("request");
var _ = require("lodash");

var Metadata = module.exports = function(spreadsheet){
  this.spreadsheet = spreadsheet;
};

Metadata.prototype.url = function(isId) {
  return this.spreadsheet.protocol+'://spreadsheets.google.com/feeds/worksheets/' +
         this.spreadsheet.spreadsheetId + '/' + (isId?'':'private/full/') + this.spreadsheet.worksheetId;
};

Metadata.prototype.extract = function(result) {
  return {
    updated: new Date(result.entry.updated),
    title: result.entry.title,
    rowCount: result.entry['gs:rowCount'],
    colCount: result.entry['gs:colCount']
  };
};

Metadata.prototype.get = function(callback) {
  var _this = this;
  this.spreadsheet.request({
    url: this.url()
  }, function(err, result) {
    if(err) return callback(err);
    callback(null, _this.extract(result));
  });
};

Metadata.prototype.set = function(data, callback) {
  var _this = this;
  //must retrieve current col/row counts if missing
  if(data.colCount === undefined || data.rowCount === undefined)
    this.get(function(err, metadata) {
      if(err) return callback(err);
      _this._set(_.extend(metadata, data), callback);
    });
  else
    _this._set(data, callback);
};

Metadata.prototype._set = function(data, callback) {
  var _this = this;
  var entry = '<entry xmlns="http://www.w3.org/2005/Atom" '+
               'xmlns:gs="http://schemas.google.com/spreadsheets/2006">'+
    '<id>'+this.url(true)+'</id>' +
    '<title>'+data.title+'</title>' +
    '<gs:colCount>'+data.colCount+'</gs:colCount>' +
    '<gs:rowCount>'+data.rowCount+'</gs:rowCount>' +
    '</entry>';

  this.spreadsheet.request({
    method: 'PUT',
    url: this.url(),
    body: entry
  }, function(err, result) {
    if(err) return callback(err);
    callback(null, _this.extract(result));
  });
};
