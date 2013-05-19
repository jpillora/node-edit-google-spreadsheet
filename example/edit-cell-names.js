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
  spreadsheet.add({
    3: {
      4: { name: "a", val: 42 },
      5: { name: "b", val: 21 },
      6: "={{ a }}+{{ b }}"      //forumla adding row3,col4 with row3,col5 => '=C3+C4'
    }
  });

  spreadsheet.put(function(err) {
    if(err) throw err;
    console.log("Cells updated");
  });
}