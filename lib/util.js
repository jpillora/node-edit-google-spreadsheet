
//parse number
exports.num = function(obj) {
  if(obj === undefined) return 0;
  if(typeof obj === 'number' || typeof obj === 'boolean') return obj;
  if(typeof obj === 'string') {
    //ensure that the string is *only* a number
    if(!/^\-?\d+(\.\d+)?$/.test(obj)) return obj;
    var res = parseFloat(obj, 10);
    if(isNaN(res)) return obj;
    return res;
  }
  throw "Invalid number: " + JSON.stringify(obj);
};

exports.int2cell = function(r,c) {
  return String.fromCharCode(64+c)+r;
};

exports.gcell2cell = function(cell, getValue, useTextValues) {
  //get formula AND has a formula?
  if(!getValue && /^=/.test(cell.inputValue)) {
    //must convert '=RC[-2]+R[3]C[-1]' to '=B5+C8'
    return cell.inputValue.replace(/(R(\[(-?\d+)\])?)(C(\[(-?\d+)\])?)/g, function() {
      return exports.int2cell(
          exports.num(cell.row) + exports.num(arguments[3] || 0),
          exports.num(cell.col) + exports.num(arguments[6] || 0)
        );
    });
  }
  //get value
  return (useTextValues) ? exports.num(cell.$t) : exports.num(cell.inputValue);
};
