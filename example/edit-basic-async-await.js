const Spreadsheet = require("../");
const creds = require("./cred-loader");

(async () => {
  try {
    let spreadsheet = await Spreadsheet.load({
      debug: true,
      oauth2: creds,
      spreadsheetName: "node-spreadsheet-example",
      worksheetName: "Sheet1"
    });
    //insert 'Zip zop' at E3
    spreadsheet.add({3: {5: "Zip zop"}});
    await spreadsheet.send();
    console.log("Updated Cell E3");
  } catch (err) {
    console.error("EROR", err);
  }
})();
