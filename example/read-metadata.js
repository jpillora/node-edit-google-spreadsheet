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
  
  spreadsheet.metadata(function(err, metadata){
    if(err) throw err;

    console.log(metadata);
    // { title: 'Sheet1', rowCount: '100', colCount: '20',
    //   updated: Sun Jul 28 2013 12:07:31 GMT+1000 (EST) }
  });
});

