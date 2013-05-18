var Spreadsheet = require('../');
var creds = require('./eg-cred-loader');

Spreadsheet.create({
  debug: false,
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
  //insert 'hello!' at E3
  spreadsheet.add({ 3: { 5: "hello!" } });

  spreadsheet.put(function(err) {
    if(err) throw err;
    console.log("Updated Cell at row 3, column 5 to 'hello!'");
  });
}