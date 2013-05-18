var Spreadsheet = require('../');
var creds = require('./eg-cred-loader');

Spreadsheet.create({
  debug: true,
  username: creds.username,
  password: creds.password,
  spreadsheetName: 'node-edit-spreadsheet',
  worksheetName: 'Sheet1',
  // spreadsheetId: 'ttFmrFPIipJimDQYSFyhwTg',
  // worksheetId: "od6",
  callback: function(err, spreadsheet) {
    if(err) throw err;
    run(spreadsheet);
  }
});

function run(spreadsheet) {
  //get all cells
  spreadsheet.get(function(err, rows, info) {
    if(err) throw err;
    console.log("Found rows:", rows);
  });
}