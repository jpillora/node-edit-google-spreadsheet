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
  
  spreadsheet.add({ 300: { 50: "hello!" } });

  spreadsheet.send({ autoSize: true }, function(err) {
    if(err) throw err;
    console.log("Resized then updated Cell at row 300, column 50 to 'hello!'");
  });
});

