var Spreadsheet = require('../');
var creds = require('./cred-loader');

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
  //insert 'hello!' at E3
  spreadsheet.add({ 3: { 5: "hello!" } });

  spreadsheet.send(function(err) {
    if(err) throw err;
    console.log("Updated Cell at row 3, column 5 to 'hello!'");
  });
});

