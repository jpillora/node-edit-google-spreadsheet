var Spreadsheet = require('../'),
    creds = require('./creds.json');

Spreadsheet.create({
  //auth
  username: creds.username,
  password: creds.password,
  spreadsheetId: '...',
  worksheetId: '...',
  callback: function(err, spreadsheet) {
    if(err) throw err;
    sheetReady(spreadsheet);
  }
});

function sheetReady(spreadsheet) {

  spreadsheet.add({ 3: { 5: "hello!" } });
  spreadsheet.send(function(err) {
    if(err) throw err;
    console.log("Updated Cell at row 3, column 5 to 'hello!'");
  });
}