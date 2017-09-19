//parse number
exports.num = function(obj) {
  if (obj === undefined) return 0;
  if (typeof obj === "number" || typeof obj === "boolean") return obj;
  if (typeof obj === "string") {
    //ensure that the string is *only* a number
    if (!/^\-?\d+(\.\d+)?$/.test(obj)) return obj;
    var res = parseFloat(obj, 10);
    if (isNaN(res)) return obj;
    return res;
  }
  throw "Invalid number: " + JSON.stringify(obj);
};

exports.int2cell = function(r, c) {
  return String.fromCharCode(64 + c) + r;
};

exports.gcell2cell = function(cell, getValue, useTextValues) {
  //get formula AND has a formula?
  if (!getValue && /^=/.test(cell.inputValue)) {
    //must convert '=RC[-2]+R[3]C[-1]' to '=B5+C8'
    return cell.inputValue.replace(
      /(R(\[(-?\d+)\])?)(C(\[(-?\d+)\])?)/g,
      function() {
        return exports.int2cell(
          exports.num(cell.row) + exports.num(arguments[3] || 0),
          exports.num(cell.col) + exports.num(arguments[6] || 0)
        );
      }
    );
  }
  //get value
  return useTextValues ? exports.num(cell.$t) : exports.num(cell.inputValue);
};

exports.promiseify = function(callback) {
  if (typeof callback === "undefined") {
    callback = function() {};
  }
  if (typeof callback !== "function") {
    throw new Error("Expected callback function or undefined");
  }
  if (callback.promise) {
    return callback; //already promised!
  }
  //keep a promise on the callback
  let resolve, reject;
  //wrapped callback
  let wrappedCallback = function(err, data) {
    //resolve/reject promise
    if (err) {
      reject(err);
    } else {
      let datas = Array.prototype.slice.call(arguments, 1);
      if (datas.length >= 2) {
        resolve(datas);
      } else {
        resolve(data);
      }
    }
    //proxy to callback
    callback.apply(this, arguments);
    //to allow: "return callback('it failed');"
    return callback.promise;
  };
  //store promise on callback
  wrappedCallback.promise = new Promise(function(res, rej) {
    resolve = res;
    reject = rej;
  });
  //
  return wrappedCallback;
};
