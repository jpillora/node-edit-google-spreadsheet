
//load example credential file
//in production, use enviroment variables instead
var fs = require('fs');

if(!fs.existsSync('./oauth2-creds.json')) {
  console.log('Please make a "oauth2-creds.json" file in this folder to use these examples.');
  console.log('{ "client_id": "...", "client_secret": "...", "refresh_token": "..." }');
  console.log('To retrieve this token, see ../get_oauth2_permissions.js');
  process.exit(1);
}

module.exports = require('./oauth2-creds.json');