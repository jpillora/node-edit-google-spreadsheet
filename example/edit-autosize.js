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
    spreadsheet.add({300: {50: "hello!"}});
    spreadsheet.send({autoSize: true}, function(err) {
      if (err) throw err;
      console.log(
        "Resized then updated Cell at row 300, column 50 to 'hello!'"
      );
    });
  }
);
