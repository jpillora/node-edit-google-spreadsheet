var Spreadsheet = require("../");

Spreadsheet.load(
  {
    debug: true,
    oauth2: require("./cred-loader"),
    spreadsheetName: "edit-spreadsheet-example",
    worksheetName: "Sheet1"
  },
  function run(err, spreadsheet) {
    if (err) throw err;
    //insert 'hello!' at E3
    spreadsheet.add({3: {5: "hello!"}});

    spreadsheet.send(function(err) {
      if (err) throw err;
      console.log("Updated Cell at row 3, column 5 to 'hello!'");
    });
  }
);
