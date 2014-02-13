
//parse number
exports.num = function(obj) {
  if(obj === undefined) return 0;
  if(typeof obj === 'number') return obj;
  if(typeof obj === 'string') {
    var res = parseFloat(obj, 10);
    if(isNaN(res)) return obj;
    return res;
  }
  throw "Invalid number: " + JSON.stringify(obj);
};

exports.int2cell = function(r,c) {
  return String.fromCharCode(64+c)+r;
};

exports.gcell2cell = function(cell, getValue) {
  //formula (convert '=RC[-2]+R[3]C[-1]' (on r:5 c:4) to '=B5+C8')
  if(!getValue && /^=/.test(cell.inputValue)) {
    return cell.inputValue.replace(/(R(\[(-?\d+)\])?)(C(\[(-?\d+)\])?)/g, function() {
      return exports.int2cell(
          exports.num(cell.row) + exports.num(arguments[3] || 0),
          exports.num(cell.col) + exports.num(arguments[6] || 0)
        );
    });
  }

  //parse num value (if it's not a date)
  if(cell.numericValue && cell.numericValue === cell.inputValue || isNaN(Date.parse(cell.inputValue)))
    return exports.num(cell.inputValue);
  else //use string value
    return cell.inputValue;
};
