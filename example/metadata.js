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
  spreadsheet.getMetadata(function(err, metadata){
    metadata.set('title', 'newtitle');
    //metadata.set('colCount', 50).set('rowCount', 200);
    metadata.save(function(err){
      console.log(err);
      console.log('saved!');
    })
  });
}