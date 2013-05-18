
"use strict";

//module for using the google api to retrieve anayltics data in an object
require("colors");
var request = require("request");
var _ = require("lodash");
var auth = require("./auth");
var xml = require("./xml");

//parse number
var num = function(obj) {
  if(obj === undefined) return 0;
  if(typeof obj === 'number') return obj;
  if(typeof obj === 'string') {
    var res = parseFloat(obj, 10);
    if(isNaN(res)) return obj;
    return res;
  }
  throw "Invalid number: " + JSON.stringify(obj);
};

//public api
exports.create = function(opts) {

  var spreadsheet = new Spreadsheet();

  if(!opts.callback)
    throw "Missing callback";
  if(!opts.username)
    return opts.callback("Missing 'username'");
  if(!opts.password)
    return opts.callback("Missing 'password'");
  if(!opts.spreadsheetId  && !opts.spreadsheetName)
    return opts.callback("Missing 'spreadsheetId' or 'spreadsheetName'");
  if(!opts.worksheetId  && !opts.worksheetName)
    return opts.callback("Missing 'worksheetId' or 'worksheetName'");

  _.extend(spreadsheet, _.pick( opts,
    'spreadsheetId', 'spreadsheetName',
    'worksheetId', 'worksheetName'
  ));

  auth(opts.username, opts.password, function(err, token) {
    if(err) return opts.callback(err);
    spreadsheet.init(token, opts.callback);
  });

};

//spreadsheet class
function Spreadsheet() {
  this.token = null;
  this.reset();
}

Spreadsheet.prototype.init = function(token, callback) {
  this.setToken(token);
  var _this = this;
  this.getSheetId('spread', function(err) {
    if(err) return callback(err, null);
    _this.getSheetId('work', function(err) {
      if(err) return callback(err, null);
      _this.setTemplates();
      callback(null, _this);
    });
  });
};

//get spreadsheet/worksheet ids by name
Spreadsheet.prototype.getSheetId = function(type, callback) {

  var _this = this;
  var id = type+'sheetId';
  var display = type.charAt(0).toUpperCase() + type.substr(1) + 'sheet';
  var name = this[type+'sheetName'];
  var spreadsheetUrlId = type === 'work' ? ('/' + this.spreadsheetId) : '';

  if(this[id])
    return callback(null);

  console.log(("Searching for "+display+" '"+name+"'...").grey);

  request({
    method: 'GET',
    url: 'https://spreadsheets.google.com/feeds/'+type+'sheets'+spreadsheetUrlId+'/private/full',
    headers: this.authHeaders
  }, function(err, response, body) {
    if(err) return callback(err, null);
    xml.parseEntries(body, function(err, entries) {
      var entry = _.find(entries, function(entry) {
        return entry.title === name;
      });
      var m = null;
      if(entry)
        m = entry.id.match(/[^\/]+$/);
      if(m)
        _this[id] = m[0];
      else
        return callback(type+" '"+name+"' not found");
      callback(null);
    });
  });
};

Spreadsheet.prototype.setToken = function(token) {
  this.token = token;
  this.authHeaders = {
    'Authorization': 'GoogleLogin auth=' + token,
    'Content-Type': 'application/atom+xml',
    'GData-Version': '3.0',
    'If-Match': '*'
  };
};

Spreadsheet.prototype.baseUrl = function() {
  return 'http://spreadsheets.google.com/feeds/cells/' + this.spreadsheetId + '/' + this.worksheetId + '/private/full';
};

Spreadsheet.prototype.setTemplates = function() {

  this.bodyTemplate = _.template(
      '<feed xmlns="http://www.w3.org/2005/Atom"\n' +
      '  xmlns:batch="http://schemas.google.com/gdata/batch"\n' +
      '  xmlns:gs="http://schemas.google.com/spreadsheets/2006">\n' +
      '<id>' + this.baseUrl() + '</id>\n' +
      '<%= entries %>\n' +
      '</feed>\n');

  this.entryTemplate = _.template(
      '<entry>\n' +
      '  <batch:id>UpdateR<%= row %>C<%= col %></batch:id>\n' +
      '  <batch:operation type="update"/>\n' +
      '  <id>' + this.baseUrl() + '/R<%= row %>C<%= col %></id>\n' +
      '  <link rel="edit" type="application/atom+xml"\n' +
      '  href="' + this.baseUrl() + '/R<%= row %>C<%= col %>"/>\n' +
      '  <gs:cell row="<%= row %>" col="<%= col %>" inputValue=\'<%= val %>\'/>\n' +
      '</entry>\n');
};

Spreadsheet.prototype.reset = function() {
  //map { r: { c: CELLX, c: CELLY }}
  this.entries = {};
  //map { name: CELL }
  this.names = {};
};

Spreadsheet.prototype.add = function(cells) {
  //init data
  if(_.isArray(cells))
    this.arr(cells, 0, 0);
  else
    this.obj(cells, 0, 0);
};

Spreadsheet.prototype.arr = function(arr, ro, co) {
  var i, j, rows, cols, rs, cs;

  // console.log("Add Array: " + JSON.stringify(arr));
  ro = num(ro);
  co = num(co);

  rows = arr;
  for(i = 0, rs = rows.length; i<rs; ++i) {
    cols = rows[i];
    if(!_.isArray(cols)) {
      this.addVal(cols, i+1+ro, 1+co);
      continue;
    }
    for(j = 0, cs = cols.length; j<cs; ++j) {
      this.addVal(cols[j], i+1+ro, j+1+co);
    }
  }
  return;
};

Spreadsheet.prototype.obj = function(obj, ro, co) {
  var row, col, cols;

  // console.log("Add Object: " + JSON.stringify(obj));

  ro = num(ro);
  co = num(co);

  for(row in obj) {
    row = num(row);
    cols = obj[row];

    //insert array
    if(_.isArray(cols)) {
      this.arr(cols, row-1, 0);
      continue;
    }

    //insert obj
    for(col in cols) {
      col = num(col);
      var data = cols[col];
      if(_.isArray(data))
        this.arr(data, row-1+ro, col-1+co);
      else
        this.addVal(data, row+ro, col+co);
    }
  }
};

Spreadsheet.prototype.int2cell = function(r,c) {
  return String.fromCharCode(64+c)+r;
};

Spreadsheet.prototype.getNames = function(curr) {
  var _this = this;
  return curr.val
    .replace(/\{\{\s*([\-\w\s]*?)\s*\}\}/g, function(str, name) {
      var link = _this.names[name];
      if(!link) return console.log(("WARNING: could not find: " + name).yellow);
      return _this.int2cell(link.row, link.col);
    })
    .replace(/\{\{\s*([\-\d]+)\s*,\s*([\-\d]+)\s*\}\}/g, function(both,r,c) {
      return _this.int2cell(curr.row + num(r), curr.col + num(c));
    });
};

Spreadsheet.prototype.addVal = function(val, row, col) {

  // console.log(("Add Value at R"+row+"C"+col+": " + val).white);

  if(!this.entries[row]) this.entries[row] = {};
  if(this.entries[row][col])
    console.log(("WARNING: R"+row+"C"+col+" already exists").yellow);

  var obj = { row: row, col: col },
      t = typeof val;
  if(t === 'string' || t === 'number')
    obj.val = val;
  else
    obj = _.extend(obj, val);

  if(obj.name)
    if(this.names[obj.name])
      throw "Name already exists: " + obj.name;
    else
      this.names[obj.name] = obj;

  if(obj.val === undefined && !obj.ref)
    console.log(("WARNING: Missing value in: " + JSON.stringify(obj)).yellow);

  this.entries[row][col] = obj;
};

Spreadsheet.prototype.toString = function() {

  var row, col, strs = [];

  for(row in this.entries)
    for(col in this.entries[row]) {
      var obj = this.entries[row][col];

      if(typeof obj.val === 'string')
        obj.val = this.getNames(obj);

      if(obj.val === undefined)
        continue;
      else
        obj.val = _.escape(obj.val.toString());

      strs.push(this.entryTemplate(obj));
    }

  return strs.join('\n');
};

Spreadsheet.prototype.send = function(callback) {

  if(!callback) callback = function() {};

  if(!this.token)
    return callback("No authorization token. Use auth() first.");
  if(!this.bodyTemplate || !this.entryTemplate)
    return callback("No templates have been created. Use setTemplates() first.");

  var _this = this,
      entries = this.toString(),
      body = this.bodyTemplate({ entries: entries });

  //finally send all the entries
  console.log(("Updating Google Docs...").grey);
  // console.log(entries.white);
  request({
    method: 'POST',
    url: this.baseUrl() + '/batch',
    headers: this.authHeaders,
    body: body
  }, function(error, response, body) {

    if(error) return callback(error, null);

    //data has been successfully, clear it
    _this.reset();

    if(body.indexOf("success='0'") >= 0) {
      error = "Error Updating Spreadsheet";
      console.log(error.red.underline + ("\nResponse:\n" + body));
    } else {
      console.log("Successfully Updated Spreadsheet".green);
    }

    callback(error);
  });

};

Spreadsheet.prototype.getRows = function(callback){

  if(!this.token)
    return callback("No authorization token. Use auth() first.");

  var _this = this;

  // get some stuff
  request({
    method: 'GET',
    url: this.baseUrl(),
    headers: this.authHeaders
  }, function(err, response, body) {

    if(err) return callback(err, null);

    if(body.indexOf("success='0'") >= 0) {
      err = "Error Reading Spreadsheet";
      console.log(err.red.underline + ("\nResponse:\n" + body));
      callback(err, null);
      return;
    }

    console.log("Parsing Rows from Spreadsheet...".green);

    xml.parseEntries(body, function(err, entries) {

      if(err) return callback(err, null);

      var rows = {};
      var maxRow = 0;

      // no rows - return empty
      if(!entries){
        rows.totalRows = 0;
        rows.lastRow = 1;
        callback(null, rows);
        return;
      }

      _.each(entries, function(entry) {

        var cell = entry['gs:cell']['@'];

        throw "TODO"

        console.log();

        var rowNumber = parseInt(entry.title.match(/([0-9]+)/), 10);

        if(!_.isArray(rows[rowNumber]))
          rows[rowNumber] = [];

        // work out the max row
        if(maxRow < rowNumber)  maxRow = rowNumber;

        // add the cell to the row
        rows[rowNumber].push(entry);
      });

      // add a few handy variables
      rows.totalRows = _.size(rows);
      rows.lastRow = maxRow;
      rows.nextRow = maxRow+1;

      console.log("Found "+rows.totalRows+" Rows".green);

      callback(null,rows);
    });

  });

};

