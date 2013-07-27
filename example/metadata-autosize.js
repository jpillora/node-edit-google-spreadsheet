var Spreadsheet = require('../');
var creds = require('./cred-loader');

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
  //Change the worksheet name
  spreadsheet.addVal('value', 200, 50);
  spreadsheet.send(function(err){
    console.log(err);
  }, {autoSize: true});

}