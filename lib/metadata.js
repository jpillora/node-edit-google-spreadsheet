var request = require("request");
var PROPS = {
  'title': 'title',
  'rowCount': 'gs$rowCount',
  'colCount': 'gs$colCount'
};


var Metadata = function(spreadsheet, data){
  this.spreadsheet = spreadsheet;
  this.data = data;
};
module.exports = Metadata;

Metadata.prototype.get = function(prop) {
  return this.data.entry[getPropName(prop)].$t;
};

Metadata.prototype.getRaw = function() {
  return this.data.entry;
};

Metadata.prototype.set = function(prop, value) {
  this.data.entry[getPropName(prop)].$t = value;
  return this;
};

Metadata.prototype.save = function(callback) {
  var entry = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gs="http://schemas.google.com/spreadsheets/2006">'+
    '<id>'+this.data.entry.id.$t+'</id>'+
    '<title>'+this.get('title')+'</title>'+
    '<gs:colCount>'+this.get('colCount')+'</gs:colCount>'+
    '<gs:rowCount>'+this.get('rowCount')+'</gs:rowCount>'+
    '</entry>';
  var editLink = getEditLink.apply(this);
  request({
    method: 'PUT',
    url: editLink,
    headers: this.spreadsheet.authHeaders,
    body: entry
  }, callback); 
};

function getPropName(prop){
  if(!PROPS[prop]) { throw 'Invalid property: ' + prop; }
  return PROPS[prop];
}

function getEditLink(){
  var i=0, 
      total=this.data.entry.link.length,
      link;
  for(;i<total; i++){
    link = this.data.entry.link[i];
    if(link.rel == 'edit'){
      return link.href;
    }
  }
  throw 'Cannot find the edit link';
}