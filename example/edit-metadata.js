var Spreadsheet = require('../');
var creds = require('./cred-loader');
var util = require('util');

Spreadsheet.load({
  debug: true,
  username: creds.username,
  password: creds.password,
  spreadsheetName: 'node-edit-spreadsheet',
  worksheetName: 'Sheet1',
  // spreadsheetId: 'tI1mkRABSRt3tQX3b-CRPbw',
  // worksheetId: 'od6'
}, function run(err, spreadsheet) {
  if(err) throw err;
  
  spreadsheet.metadata({
    title: 'Sheet1',
    rowCount: 5,
    colCount: 5
  }, function(err, metadata){
    if(err) throw err;
    console.log(metadata);
  });
});

