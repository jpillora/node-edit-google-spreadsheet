## Node - Edit Google Spreadsheet

Currently, there are about 3 different node modules which allow you to read data off Google Spreadsheets, though none with a good write API. Enter `edit-google-spreadsheet`. A simple API for editting Google Spreadsheets.

#### Install
```
npm install edit-google-spreadsheet
```

#### Basic Usage

Create sheet:

``` js
  var Spreadsheet = require('edit-google-spreadsheet');

  Spreadsheet.create({
    //auth
    username: '...',
    password: '...',
    spreadsheetId: '...',
    worksheetId: '...',
    callback: function(err, spreadsheet) {
      if(err) throw err;
      sheetReady(spreadsheet);
    }
  });
  
```

Update sheet:

``` js
  function sheetReady(spreadsheet) {
  
    spreadsheet.add({ 3: { 5: "hello!" } });
  
    spreadsheet.send(function(err) {
      if(err) throw err;
      console.log("Updated Cell at row 3, column 5 to 'hello!'");
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
*Note: cell `a` and `b` are looked up on `send()`*


#### API

#####spreadsheet.`add( obj | array )`
Add cells to the batch. See examples.

#####spreadsheet.`send( callback )`
Sends off the batch of `add`ed cells. Clears all cells once complete. Callback has signature: `funciton(err, result) {}`.

#### Todo

* OAuth
* Create New Spreadsheets
* Read Spreadsheet data
* List Spreadsheets on account
* List Worksheets on spreadsheet

#### FAQ

* Q: How do I append rows to my spreadsheet ?
* A: Currently this is not supported as the module would need to calculate the last blank row and it does not do this yet. Your best option is to do something like:

```javascript
var current = 0;
var append = function(row) {
  var r = {};
  r[current++] = row; //row can be an array or an object with integer keys
  spreadsheet.add(r);
};

```

#### Credits

Thanks to `googleclientlogin` for easy Google API ClientLogin Tokens
