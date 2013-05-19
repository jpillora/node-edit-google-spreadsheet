## Node - Edit Google Spreadsheet

Currently, there are about 3 different node modules which allow you to read data off Google Spreadsheets, though none with a good write API. Enter `edit-google-spreadsheet`. A simple API for reading and updating Google Spreadsheets.

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
    callback: sheetReady
  });
  
```

*Note: Using the options `spreadsheetName` and `worksheetName` will cause lookups for `spreadsheetId` and `worksheetId`. Use `spreadsheetId` and `worksheetId` for improved performance.*

Update sheet:

``` js
  function sheetReady(err, spreadsheet) {
    if(err) throw err;
  
    spreadsheet.add({ 3: { 5: "hello!" } });
  
    spreadsheet.send(function(err) {
      if(err) throw err;
      console.log("Updated Cell at row 3, column 5 to 'hello!'");
    });
  }
```

Read sheet:

``` js
  function sheetReady(err, spreadsheet) {
    if(err) throw err;
  
    spreadsheet.recieve(function(err, rows) {
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
    6: "={{ a }}+{{ b }}"      //forumla adding row3,col4 with row3,col5 => '=D3+E3'
  }
});
```
*Note: cell `a` and `b` are looked up on `send()`*


#### API

##### spreadsheet.`add( obj | array )`
Add cells to the batch. See examples.

##### spreadsheet.`send( callback( err, result ) )`
Sends off the batch of `add()`ed cells. Clears all cells once complete.

##### spreadsheet.`recieve( callback( err , rows , info ) )`
Recieves the entire spreadsheet. The `rows` object returned is in the same object format as the cells you `add()`, so `add(rows)` will be valid. The `info` object looks like `{ totalRows: 1, totalCells: 1, lastRow: 3, nextRow: 4 }`.

#### Options

##### debug
If `true`, will display colourful console logs outputing current actions

##### username password
Google account - *Be careful about committing these to public repos*

##### spreadSheetName spreadsheetId
The spreadsheet you wish to edit. Either the Name or Id is required.

##### workSheetName worksheetId
The worksheet you wish to edit. Either the Name or Id is required.

##### callback
Function returning the authenticated Spreadsheet instance

#### Todo

* OAuth
* Create New Spreadsheets
* Read specific range of cells

#### FAQ

* Q: How do I append rows to my spreadsheet ?
* A: Using the `info` object returned from `recieve()`, one could always begin `add()`ing at the `nextRow`, thereby appending to the spreadsheet.

#### Credits

Thanks to `googleclientlogin` for easy Google API ClientLogin Tokens
