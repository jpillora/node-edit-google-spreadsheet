
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;

//client auth helper
module.exports = function(usr, pw, done) {
  if(!usr || !pw || !done) return;

  console.log('Logging into Google...'.grey);

  var googleAuth = new GoogleClientLogin({
    email: usr,
    password: pw,
    service: 'spreadsheets',
    accountType: GoogleClientLogin.accountTypes.google
  });
  //error - show and exit
  googleAuth.on(GoogleClientLogin.events.error, function(e) {
    done("Google Auth Error: " + e.message);
  });
  //success - next step
  googleAuth.on(GoogleClientLogin.events.login, function() {
    console.log('Logged into Google'.green);
    done(null, googleAuth.getAuthId());
  });
  googleAuth.login();
};