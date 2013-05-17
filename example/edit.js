

var Spreadsheet = require('../');

//load example credential file
//in production, use enviroment variables instead
var fs = require('fs');
if(!fs.existsSync('./creds.json')) {
  console.log('Please make a "creds.json" file to use this example.');
  process.exit(1);
}
var creds = require('./creds.json');

Spreadsheet.create({
  //auth
  username: creds.username,
  password: creds.password,
  //retrieve by name in progress...
  spreadsheetName: '...',
  worksheetName: '...',
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