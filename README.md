## Node - Edit Google Spreadsheet

Currently, there are about 3 different node modules which allow you to read data off Google Spreadsheets, though none with a good write API. Enter `edit-google-spreadsheet`. A simple API for reading and editting Google Spreadsheets.

*Warning: There have been API changes since last release. See below.*

#### Install
```
npm install edit-google-spreadsheet
```

#### Basic Usage

Create sheet:

``` js
  var Spreadsheet = require('edit-google-spreadsheet');

  Spreadsheet.create({
    debug: true,
    username: '...',
    password: '...',
    spreadsheetName: 'node-edit-spreadsheet',
    worksheetName: 'Sheet1',
    callback: function(err, spreadsheet) {
      if(err) throw err;
      sheetReady(spreadsheet);
    }
  });
  
```

*Note: Using the options 'spreadsheetName' and 'worksheetName' will cause lookups for 'spreadsheetId' and 'worksheetId'. Use 'spreadsheetId' and 'worksheetId' for improved performance.*

Update sheet:

``` js
  function sheetReady(spreadsheet) {
  
    spreadsheet.add({ 3: { 5: "hello!" } });
  
    spreadsheet.put(function(err) {
      if(err) throw err;
      console.log("Updated Cell at row 3, column 5 to 'hello!'");
    });
  }
```

Read sheet:

``` js
  function sheetReady(spreadsheet) {
  
    spreadsheet.get(function(err, rows) {
      if(err) throw err;
      console.log("Found rows:", rows);

      // Found rows: { '3': { '5': 'hello!' } }
    });

  }
```

#### More Examples

Batch edit:

``` js
spreadsheet.add([[1,2,3],
                 [4,5,6]]);
```

Batch edit starting from row 5:

``` js
spreadsheet.add({
  5: [[1,2,3],
      [4,5,6]]
});
```

Batch edit starting from row 5, column 7:

``` js
spreadsheet.add({
  5: {
    7: [[1,2,3],
        [4,5,6]]
  }
});
```

Named cell references:
``` js
spreadsheet.add({
  3: {
    4: { name: "a", val: 42 },
    5: { name: "b", val: 21 },
    6: "={{ a }}+{{ b }}"      //forumla adding row3,col4 with row3,col5 => '=C3+C4'
  }
});
```
*Note: cell `a` and `b` are looked up on `put()`*


#### API

#####spreadsheet.`add( obj | array )`
Add cells to the batch. See examples.

#####spreadsheet.`put( callback )`
Sends off the batch of `add`ed cells. Clears all cells once complete. Callback has signature: `funciton(err, result) {}`.

#####spreadsheet.`get( callback , rows , info )`
Retrieves the entire spreadsheet. The `rows` object returned is in the same format as the cells you `put()`. The `info` object looks like `{ totalRows: 1, totalCells: 1, lastRow: 3, nextRow: 4 }`.

#### Options

##### debug
If truthy, will display colourful console logs outputing current actions

##### username password
Google account - Be careful about committing these to public repos

##### spreadSheetName spreadsheetId
The spreadsheet you wish to edit. Either the Name or Id is required.

##### workSheetName worksheetId
The worksheet you wish to edit. Either the Name or Id is required.

##### callback
Function returning the authenticated Spreadsheet instance

#### Todo

* OAuth
* Create New Spreadsheets

#### FAQ

* Q: How do I append rows to my spreadsheet ?
* A: Using the `info` object returned from `get()`, one could always at the `nextRow`, thereby appending to the spreadsheet.

#### Credits

Thanks to `googleclientlogin` for easy Google API ClientLogin Tokens
