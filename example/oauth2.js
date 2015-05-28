// Example of OAuth2 login using "Client ID for native application" and a
// refresh token of an oauth2 grant.
//
// To prepare the refresh_token, please se the get_oauth2_permission.js
//

var Spreadsheet = require('../');

Spreadsheet.load({
  debug: true,
  oauth2: {
    client_id : '<garbage>.apps.googleusercontent.com',
    client_secret : '<more garbage>',
    refresh_token : '<even more garbage>'
  },
  spreadsheetName: 'node-edit-spreadsheet',
  worksheetName:   'Sheet1',
  // spreadsheetId: 'ttFmrFPIipJimDQYSFyhwTg',
  // worksheetId: "od6"
}, function run(err, spreadsheet) {
  if(err) throw err;
  //receive all cells
  spreadsheet.receive({getValues:false},function(err, rows, info) {
    if(err) throw err;
    console.log("Found rows:", rows);
    console.log("With info:", info);
  });
});

