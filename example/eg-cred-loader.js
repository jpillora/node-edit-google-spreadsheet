
//load example credential file
//in production, use enviroment variables instead
var fs = require('fs');

if(!fs.existsSync('./creds.json')) {
  console.log('Please make a "creds.json" file in this folder to use these examples.');
  console.log('{ "username": "...", "password": "..." }');
  process.exit(1);
}

module.exports = require('./creds.json');