const Spreadsheet = require("../");
const creds = require("./cred-loader");

(async () => {
  try {
    console.log("load....");
    let spreadsheet = await Spreadsheet.load({
      debug: true,
      oauth2: creds,
      spreadsheetName: "node-spreadsheet-example",
      worksheetName: "Sheet1"
    });
    console.log("loaded");
    //receive all cells
    let [rows, info] = await spreadsheet.receive({getValues: false});
    console.log("Found rows:", rows);
    console.log("With info:", info);
  } catch (err) {
    console.error("EROR", err);
  }
})();
