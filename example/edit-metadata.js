var Spreadsheet = require("../");
var util = require("util");

Spreadsheet.load(
  {
    debug: true,
    oauth2: require("./cred-loader"),
    spreadsheetName: "edit-spreadsheet-example",
    worksheetName: "Sheet1"
  },
  function run(err, spreadsheet) {
    if (err) throw err;
    spreadsheet.metadata(
      {
        title: "Sheet1",
        rowCount: 5,
        colCount: 5
      },
      function(err, metadata) {
        if (err) throw err;
        console.log(metadata);
      }
    );
  }
);
