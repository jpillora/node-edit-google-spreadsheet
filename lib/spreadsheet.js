"use strict";

//module for using the google api to get anayltics data in an object
require("colors");
var request = require("request");
var _ = require("lodash");
var auth = require("./auth");
var util = require("./util");
var Metadata = require('./metadata');
var async = require('async');
var xml2js = require('xml2js');

//public api
exports.create = exports.load = function(opts, callback) {
  if (!callback)
    callback = opts.callback;
  if (!callback)
    throw "Missing callback";
  if (!(opts.username && opts.password) && !opts.oauth && !opts.oauth2 && !opts.accessToken)
    return callback("Missing authentication information");
  if (!opts.spreadsheetId && !opts.spreadsheetName)
    return callback("Missing 'spreadsheetId' or 'spreadsheetName'");
  if (!opts.worksheetId && !opts.worksheetName)
    return callback("Missing 'worksheetId' or 'worksheetName'");

  //default to true if useCellTextValues is not set or defined.
  opts.useCellTextValues = (_.has(opts, 'useCellTextValues')) ? opts.useCellTextValues : true;

  var spreadsheet = new Spreadsheet(opts);

  //default to http's' when undefined
  opts.useHTTPS = opts.useHTTPS === false ? '' : 's';
  spreadsheet.protocol += opts.useHTTPS;

  //add to spreadsheet
  _.extend(spreadsheet, _.pick(opts,
    'spreadsheetId', 'spreadsheetName',
    'worksheetId', 'worksheetName', 'debug'
  ));

  spreadsheet.log('Logging into Google...'.grey);
  auth(opts, function(err, token) {
    if (err) return callback(err);
    spreadsheet.log('Logged into Google'.green);
    spreadsheet.setToken(token);
    spreadsheet.init(callback);
  });
};

//spreadsheet class
function Spreadsheet(opts) {
  this.opts = opts;
  this.raw = {};
  this.protocol = 'http';
  this.xmlParser = new xml2js.Parser({
    charkey: '$t',
    explicitArray: false,
    explicitCharkey: false,
    mergeAttrs: true,
    valueProcessors: [xml2js.processors.parseNumbers],
    attrValueProcessors: [xml2js.processors.parseNumbers],
  });
  this.reset();
}

Spreadsheet.prototype.init = function(callback) {
  var _this = this;
  this.getSheetId('spread', function(err) {
    if (err) return callback(err, null);
    _this.getSheetId('work', function(err) {
      if (err) return callback(err, null);
      _this.setTemplates();
      callback(null, _this);
    });
  });
};

Spreadsheet.prototype.log = function() {
  if (this.debug) console.log.apply(console, arguments);
};

//spreadsheet.request wraps mikeal's request with
//google spreadsheet specific additions (adds token, follow)
Spreadsheet.prototype.request = function(opts, callback) {

  if (!_.isPlainObject(opts) || !opts.url)
    return callback("Invalid request");

  if (!this.authHeaders)
    return callback("No authorization token. Use auth() first.");
  //use pre-generated authenication headers
  opts.headers = this.authHeaders;

  //default to GET
  if (!opts.method)
    opts.method = 'GET';

  //follow redirects - even from POSTs
  opts.followAllRedirects = true;

  var _this = this;
  request(opts, function(err, response, body) {
    //show error
    if (err)
      return callback(err);
    //missing the response???
    if (!response)
      return callback('no response');

    //reauth
    if (response.statusCode === 401 && typeof _this.opts.accessToken !== 'object') {
      _this.log('Authentication token expired. Logging into Google again...'.grey);
      return auth(_this.opts, function(err, token) {
        if (err) return callback(err);
        _this.setToken(token);
        _this.request(opts, callback);
      });
    }

    //body is error
    if (response.statusCode !== 200)
      return callback(body);

    //try to parse XML
    _this.xmlParser.parseString(body, callback);
  });
};

//get spreadsheet/worksheet ids by name
Spreadsheet.prototype.getSheetId = function(type, callback) {

  var _this = this;
  var id = type + 'sheetId';
  var display = type.charAt(0).toUpperCase() + type.substr(1) + 'sheet';
  var name = this[type + 'sheetName'];
  var spreadsheetUrlId = type === 'work' ? ('/' + this.spreadsheetId) : '';

  //already have id
  if (this[id])
    return callback(null);

  this.log(("Searching for " + display + " '" + name + "'...").grey);

  this.request({
    url: this.protocol + '://spreadsheets.google.com/feeds/' +
      type + 'sheets' + spreadsheetUrlId + '/private/full'
  }, function(err, result) {
    if (err) return callback(err);

    var entries = result.feed.entry || [];

    // Force array format for result
    if (!(entries instanceof Array)) {
      entries = [entries];
    }

    //store raw mapped results
    _this.raw[type + 'sheets'] = entries.map(function(e1) {
      var e2 = {};
      for (var prop in e1) {
        var val = e1[prop];
        //remove silly $t object
        if (typeof val === 'object') {
          var keys = Object.keys(val);
          if (keys.length === 1 && keys[0] === "$t")
            val = val.$t;
        }
        //remove silly gs$
        if (/^g[a-z]\$(\w+)/.test(prop))
          e2[RegExp.$1] = isNaN(Number(val)) ? val : Number(val);
        else
          e2[prop] = isNaN(Number(val)) ? val : Number(val);
      }
      //search for 'name', extract only end portion of URL!
      if (e2.title === name && e2.id && /([^\/]+)$/.test(e2.id))
        _this[id] = RegExp.$1;

      return e2;
    });

    var m = null;
    if (!_this[id])
      return callback(type + "sheet '" + name + "' not found");

    _this.log(("Tip: Use option '" + type + "sheetId: \"" + _this[id] + "\"' for improved performance").yellow);
    callback(null);

  });
};

Spreadsheet.prototype.setToken = function(token) {
  this.authHeaders = {
    'Authorization': token.type + ' ' + token.token,
    'Content-Type': 'application/atom+xml',
    'GData-Version': '3.0',
    'If-Match': '*'
  };
};

Spreadsheet.prototype.baseUrl = function() {
  return this.protocol + '://spreadsheets.google.com/feeds/cells/' + this.spreadsheetId + '/' + this.worksheetId + '/private/full';
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
    '   href="' + this.baseUrl() + '/R<%= row %>C<%= col %>"/>\n' +
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
  if (_.isArray(cells))
    this.arr(cells, 0, 0);
  else
    this.obj(cells, 0, 0);
};

Spreadsheet.prototype.arr = function(arr, ro, co) {
  var i, j, rows, cols, rs, cs;

  // _this.log("Add Array: " + JSON.stringify(arr));
  ro = util.num(ro);
  co = util.num(co);

  rows = arr;
  for (i = 0, rs = rows.length; i < rs; ++i) {
    cols = rows[i];
    if (!_.isArray(cols)) {
      this.addVal(cols, i + 1 + ro, 1 + co);
      continue;
    }
    for (j = 0, cs = cols.length; j < cs; ++j) {
      this.addVal(cols[j], i + 1 + ro, j + 1 + co);
    }
  }
  return;
};

Spreadsheet.prototype.obj = function(obj, ro, co) {
  var row, col, cols;

  // _this.log("Add Object: " + JSON.stringify(obj));
  ro = util.num(ro);
  co = util.num(co);

  for (row in obj) {
    row = util.num(row);
    cols = obj[row];

    //insert array
    if (_.isArray(cols)) {
      this.arr(cols, row - 1, 0);
      continue;
    }

    //insert obj
    for (col in cols) {
      col = util.num(col);
      var data = cols[col];
      if (_.isArray(data))
        this.arr(data, row - 1 + ro, col - 1 + co);
      else
        this.addVal(data, row + ro, col + co);
    }
  }
};

//dereference named cells {{ myCell }}
Spreadsheet.prototype.getNames = function(curr) {
  var _this = this;
  return curr.val
    .replace(/\{\{\s*([\-\w\s]*?)\s*\}\}/g, function(str, name) {
      var link = _this.names[name];
      if (!link) return _this.log(("WARNING: could not find: " + name).yellow);
      return util.int2cell(link.row, link.col);
    })
    .replace(/\{\{\s*([\-\d]+)\s*,\s*([\-\d]+)\s*\}\}/g, function(both, r, c) {
      return util.int2cell(curr.row + util.num(r), curr.col + util.num(c));
    });
};

Spreadsheet.prototype.addVal = function(val, row, col) {

  // _this.log(("Add Value at R"+row+"C"+col+": " + val).white);

  if (!this.entries[row]) this.entries[row] = {};
  if (this.entries[row][col])
    this.log(("WARNING: R" + row + "C" + col + " already exists").yellow);

  var obj = {
      row: row,
      col: col
    },
    t = typeof val;

  if (t === 'string' || t === 'number' || t === 'boolean')
    obj.val = val;
  else
    obj = _.extend(obj, val);

  if (obj.name)
    if (this.names[obj.name])
      throw "Name already exists: " + obj.name;
    else
      this.names[obj.name] = obj;

  if (obj.val === undefined && !obj.ref)
    this.log(("WARNING: Missing value in: " + JSON.stringify(obj)).yellow);

  this.entries[row][col] = obj;
};

//convert pending batch into a string
Spreadsheet.prototype.compile = function() {

  var row, col, strs = [];
  this.maxRow = 0;
  this.maxCol = 0;
  for (row in this.entries)
    for (col in this.entries[row]) {
      var obj = this.entries[row][col];
      this.maxRow = Math.max(this.maxRow, row);
      this.maxCol = Math.max(this.maxCol, col);
      if (typeof obj.val === 'string')
        obj.val = this.getNames(obj);

      if (obj.val === undefined)
        continue;
      else
        obj.val = _.escape(obj.val.toString());

      strs.push(this.entryTemplate(obj));
    }

  return this.bodyTemplate({
    entries: strs.join('\n')
  });
};

//send (bulk) changes
Spreadsheet.prototype.send = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (!callback)
    callback = function() {};

  if (!this.bodyTemplate || !this.entryTemplate)
    return callback("No templates have been created. Use setTemplates() first.");

  var _this = this,
    body = this.compile();

  //finally send all the entries
  _this.log(("Sending updates...").grey);
  // _this.log(entries.white);
  async.series([

    function autoSize(next) {
      if (!options.autoSize)
        return next();
      _this.log("Determining worksheet size...".grey);
      _this.metadata(function(err, metadata) {
        if (err) return next(err);

        //no resize needed
        if (metadata.rowCount >= _this.maxRow &&
          metadata.colCount >= _this.maxCol)
          return next(null);

        _this.log("Resizing worksheet...".grey);
        //resize with maximums
        metadata.rowCount = Math.max(metadata.rowCount, _this.maxRow);
        metadata.colCount = Math.max(metadata.colCount, _this.maxCol);
        _this.metadata(metadata, next);
      });
    },
    function send(next) {
      _this.request({
        method: 'POST',
        url: _this.baseUrl() + '/batch',
        body: body
      }, function(err, result) {

        var status = null;

        if (err)
          return next(err);

        if (!result.feed)
          return next("Google Spreadsheets API has changed please post an issue!");

        if (!result.feed.entry) {
          _this.log("No updates in current send()".yellow);
          _this.reset();
          return next(null);
        }

        var entries = _.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];

        // DEBUG: displays raw response from Google
        // console.log(entries);

        var errors = entries.map(function(e) {
          return { status: e['batch:status'] };
        }).filter(function(e) {
          return e.status && e.status.code !== 200;
        });

        if (errors.length > 0) {
          _this.log("Error updating spreadsheet:");
          _.each(errors, function(e, i) {
            _this.log("  #" + (i+1) + " [" + e.status.code + "] " + e.status.reason);
          });

          //concat error messages
          var msg = "Error updating spreadsheet: " +
            errors.map(function(e, i) {
              // var msg = errors.length > 1 ? ("#"+(i+1)) : "";
              var msg = e.status.reason;
              //swap out no message or a the silly "wait a bit" message
              if(!msg || /Please wait a bit and try reloading your spreadsheet/.test(msg))
                msg = "Your update may not fit in the worksheet. See the 'autoSize' option.";
              return msg;
            }).join(" ");

          next(msg);
          return;
        }

        _this.log("Successfully Updated Spreadsheet".green);
        //data has been successfully sent, clear it
        _this.reset();
        next(null);
        return;
      });
    }
  ], callback);
};

//Get entire spreadsheet
Spreadsheet.prototype.receive = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var _this = this;
  // get whole spreadsheet
  this.request({
    url: this.baseUrl()
  }, function(err, result) {
    if (!result || !result.feed) {
      err = "Error Reading Spreadsheet";
      _this.log(
        err.red.underline +
        ("\nData:\n") + JSON.stringify(_this.entries, null, 2));
      callback(err, null);
      return;
    }

    var entries = result.feed.entry || [];
    // Force array format for result
    if (!(entries instanceof Array)) {
      entries = [entries];
    }
    var rows = {};
    var info = {
      spreadsheetId: _this.spreadsheetId,
      worksheetId: _this.worksheetId,
      worksheetTitle: result.feed.title.$t || result.feed.title || null,
      worksheetUpdated: new Date(result.feed.updated.$t || result.feed.updated) || null,
      authors: result.feed.author && result.feed.author.name,
      totalCells: entries.length,
      totalRows: 0,
      lastRow: 1,
      nextRow: 1
    };
    var maxRow = 0;

    _.each(entries, function(entry) {
      var cell = entry['gs:cell'],
        r = cell.row,
        c = cell.col;
      if (!rows[r]) {
        info.totalRows++;
        rows[r] = {};
      }

      rows[r][c] = util.gcell2cell(cell, options.getValues, _this.opts.useCellTextValues);
      info.lastRow =  util.num(r);
    });

    if (entries.length)
      info.nextRow = info.lastRow + 1;

    _this.log(("Retrieved " + entries.length + " cells and " + info.totalRows + " rows").green);

    callback(null, rows, info);
  });
};

Spreadsheet.prototype.metadata = function(data, callback) {
  var meta = new Metadata(this);
  if (typeof data === 'function') {
    callback = data;
    meta.get(callback);
    return;
  } else if (!callback) {
    callback = function() {};
  }
  meta.set(data, callback);
  return;
};
