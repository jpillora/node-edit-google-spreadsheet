## Node - Edit Google Spreadsheet

Currently, there are about 3 different node modules which allow you to read data off Google Spreadsheets, though none with a good write API. Enter `edit-google-spreadsheet`. A simple API for reading and updating Google Spreadsheets.

#### Install
```
npm install edit-google-spreadsheet
```

#### Basic Usage

Create sheet with client login:

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

Create sheet with OAuth:

``` js
  var Spreadsheet = require('edit-google-spreadsheet');

  Spreadsheet.create({
    debug: true,
    oauth : {
      email: 'some-id@developer.gserviceaccount.com',
      keyFile: 'private-key.pem'
    },
    spreadsheetName: 'node-edit-spreadsheet',
    worksheetName: 'Sheet1',
    callback: sheetReady
  });
```

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

    spreadsheet.receive(function(err, rows, info) {
      if(err) throw err;
      console.log("Found rows:", rows);
      // Found rows: { '3': { '5': 'hello!' } }
    });

  }
```
#### Metadata
You can get/update the worksheet metadata:
``` js
spreadsheet.getMetadata(function(err, metadata){
  metadata.getRaw();
  metadata.get(prop);
  metadata.set(prop, value);
  metadata.save(function(err){});
});
```
Available property names are:
- title: the worksheet name. Change this property to rename the worksheet
- rowCount: total rows. Change this property to set the total rows
- colCount: total columns. Change this property to set the total columns

#### More `add` Examples

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

Formula building with named cell references:
``` js
spreadsheet.add({
  3: {
    4: { name: "a", val: 42 }, //'42' though tagged as "a"
    5: { name: "b", val: 21 }, //'21' though tagged as "b"
    6: "={{ a }}+{{ b }}"      //forumla adding row3,col4 with row3,col5 => '=D3+E3'
  }
});
```
*Note: cell `a` and `b` are looked up on `send()`*

#### API

##### spreadsheet.`add( obj | array )`
Add cells to the batch. See examples.

##### spreadsheet.`send( callback( err ), [options] )`
Sends off the batch of `add()`ed cells. Clears all cells once complete.
#### Options
##### `autoSize`
Increase the page size (rows and columns) in order to content fits on it.

##### spreadsheet.`receive( callback( err , rows , info ) )`
Recieves the entire spreadsheet. The `rows` object is an object in the same format as the cells you `add()`, so `add(rows)` will be valid. The `info` object looks like:

```
{
  spreadsheetId: 'ttFmrFPIipJimDQYSFyhwTg',
  worksheetId: 'od6',
  worksheetTitle: 'Sheet1',
  worksheetUpdated: '2013-05-31T11:38:11.116Z',
  authors: [ { name: 'jpillora', email: 'dev@jpillora.com' } ],
  totalCells: 1,
  totalRows: 1,
  lastRow: 3,
  nextRow: 4
}
```

#### Options

##### `callback`
Function returning the authenticated Spreadsheet instance.

##### `debug`
If `true`, will display colourful console logs outputing current actions.

##### `username` `password`
Google account - *Be careful about committing these to public repos*.

##### `oauth`
OAuth configuration object. See [google-oauth-jwt](https://github.com/extrabacon/google-oauth-jwt). *By default `oauth.scopes` is set to `['https://spreadsheets.google.com/feeds']` (`http` if not `useHTTPS`*

##### `spreadSheetName` `spreadsheetId`
The spreadsheet you wish to edit. Either the Name or Id is required.

##### `workSheetName` `worksheetId`
The worksheet you wish to edit. Either the Name or Id is required.

##### `useHTTPS`
Whether to use `https` when connecting to Google (default: `true`)

#### Todo

* Create New Spreadsheets
* Read specific range of cells
* Option to cache auth token in file

#### FAQ

* Q: How do I append rows to my spreadsheet ?
* A: Using the `info` object returned from `receive()`, one could always begin `add()`ing at the `nextRow`, thereby appending to the spreadsheet.

#### Credits

Thanks to `googleclientlogin` for easy Google API ClientLogin Tokens
