## Edit Google Spreadsheet

> A simple API for reading and writing Google Spreadsheets in Node.js

This module aims to be a complete wrapper around the [Google Sheets API version 3.0](https://developers.google.com/google-apps/spreadsheets/). If anything is missing, create an issue, or even better, a pull request.

[![NPM version](https://nodei.co/npm/edit-google-spreadsheet.png?compact=true)](https://npmjs.org/package/edit-google-spreadsheet)

[![Dependency Status](https://img.shields.io/david/jpillora/node-edit-google-spreadsheet.svg?style=flat-square)](https://david-dm.org/jpillora/node-edit-google-spreadsheet)

:warning: Google has finally deprecated ClientLogin, which means you can no longer authenticate with your email and password. See https://github.com/jpillora/node-edit-google-spreadsheet/issues/72 for updates.


#### Install
```
npm install edit-google-spreadsheet
```

#### Basic Usage

Load a spreadsheet:

``` js
  var Spreadsheet = require('edit-google-spreadsheet');

  Spreadsheet.load({
    debug: true,
    spreadsheetName: 'node-edit-spreadsheet',
    worksheetName: 'Sheet1',

    // Choose from 1 of the 5 authentication methods:

    //    1. Username and Password has been deprecated. OAuth2 is recommended. 

    // OR 2. OAuth
    oauth : {
      email: 'my-name@google.email.com',
      keyFile: 'my-private-key.pem'
    },

    // OR 3. OAuth2 (See get_oauth2_permissions.js)
    oauth2: {
      client_id: 'generated-id.apps.googleusercontent.com',
      client_secret: 'generated-secret',
      refresh_token: 'token generated with get_oauth2_permission.js'
    },

    // OR 4. Static Token
    accessToken: {
      type: 'Bearer',
      token: 'my-generated-token'
    },

    // OR 5. Dynamic Token
    accessToken: function(callback) {
      //... async stuff ...
      callback(null, token);
    }
  }, function sheetReady(err, spreadsheet) {
    //use speadsheet!
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

    spreadsheet.receive(function(err, rows, info) {
      if(err) throw err;
      console.log("Found rows:", rows);
      // Found rows: { '3': { '5': 'hello!' } }
    });

  }
```
#### Metadata

Get metadata

``` js
  function sheetReady(err, spreadsheet) {
    if(err) throw err;
    
    spreadsheet.metadata(function(err, metadata){
      if(err) throw err;
      console.log(metadata);
      // { title: 'Sheet3', rowCount: '100', colCount: '20', updated: [Date] }
    });
  }
```

Set metadata

``` js
  function sheetReady(err, spreadsheet) {
    if(err) throw err;
    
    spreadsheet.metadata({
      title: 'Sheet2'
      rowCount: 100,
      colCount: 20
    }, function(err, metadata){
      if(err) throw err;
      console.log(metadata);
    });
  }
```

***WARNING: all cells outside the range of the new size will be silently deleted***

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


##### `Spreadsheet.load( options, callback( err, spreadsheet ) )`

See [Options](https://github.com/jpillora/node-edit-google-spreadsheet#options) below

##### spreadsheet.`add( obj | array )`
Add cells to the batch. See examples.

##### spreadsheet.`send( [options,] callback( err ) )`
Sends off the batch of `add()`ed cells. Clears all cells once complete.

`options.autoSize` When required, increase the worksheet size (rows and columns) in order to fit the batch - *NOTE: When enabled, this will trigger an extra request on every `send()`* (default `false`).

##### spreadsheet.`receive( [options,] callback( err , rows , info ) )`
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
  lastRow: 3
}
```

`options.getValues` Always get the values (results) of forumla cells.

##### spreadsheet.`metadata( [data, ] callback )`

Get and set metadata

*Note: when setting new metadata, if `rowCount` and/or `colCount` is left out,
an extra request will be made to retrieve the missing data.*

##### spreadsheet.`raw`

The raw data recieved from Google when enumerating the spreedsheet and worksheet lists, *which are triggered when searching for IDs*. In order to see this array of all spreadsheets (`raw.spreadsheets`) the `spreadsheetName` option must be used. Similarly for worksheets (`raw.worksheets`), the `worksheetName` options must be used.

#### Options

##### `callback`
Function returning the authenticated Spreadsheet instance.

##### `debug`
If `true`, will display colourful console logs outputing current actions.

##### `username` `password`
Google account - *Be careful about committing these to public repos*.

##### `oauth`
OAuth configuration object. See [google-oauth-jwt](https://github.com/extrabacon/google-oauth-jwt#specifying-options). *By default `oauth.scopes` is set to `['https://spreadsheets.google.com/feeds']` (`https` if `useHTTPS`)*

##### `accessToken`
Reuse a generated access `token` of the given `type`. If you set `accessToken` to an object, reauthentications will not work. Instead use a `function accessToken(callback(err, token)) { ... }` function, to allow token generation when required.

##### `spreadsheetName` `spreadsheetId`
The spreadsheet you wish to edit. Either the Name or Id is required.

##### `worksheetName` `worksheetId`
The worksheet you wish to edit. Either the Name or Id is required.

##### `useHTTPS`
Whether to use `https` when connecting to Google (default: `true`)

##### `useCellTextValues`
Return text values for cells or return values as typed. (default: `true`)

#### Todo

* Create New Spreadsheets
* Read specific range of cells
* Option to cache auth token in file

#### FAQ

* Q: How do I append rows to my spreadsheet ?
* A: Using the `info` object returned from `receive()`, one could always begin `add()`ing at the `lastRow + 1`, thereby appending to the spreadsheet.

#### Credits

Thanks to `googleclientlogin` for easy Google API ClientLogin Tokens

#### References

* https://developers.google.com/google-apps/spreadsheets/

#### Donate

BTC 1AxEWoz121JSC3rV8e9MkaN9GAc5Jxvs4

#### MIT License

Copyright © 2015 Jaime Pillora &lt;dev@jpillora.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
