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
  callback: run
});

function run(err, spreadsheet) {
  if(err) throw err;
  //recieve all cells
  spreadsheet.recieve(function(err, rows, info) {
    if(err) throw err;
    console.log("Found rows:", rows);
  });
}