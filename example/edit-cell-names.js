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