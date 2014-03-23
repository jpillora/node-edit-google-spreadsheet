var Spreadsheet = require('../');
var creds = require('./cred-loader');

Spreadsheet.load({
  debug: true,
  username: creds.username,
  password: creds.password,
  spreadsheetName: 'node-edit-spreadsheet',
  worksheetName: 'Sheet1',
  // spreadsheetId: 'ttFmrFPIipJimDQYSFyhwTg',
  // worksheetId: "od6"
}, function run(err, spreadsheet) {
  if(err) throw err;

  spreadsheet.add({
    3: {
      4: { name: "a", val: 42 }, //'42' though tagged as "a"
      5: { name: "b", val: 21 }, //'21' though tagged as "b"
      6: "={{ a }}+{{ b }}"      //forumla adding row3,col4 with row3,col5 => '=D3+E3'
    }
  });

  spreadsheet.send(function(err) {
    if(err) throw err;
    console.log("Cells updated");
  });
});

