var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var GoogleOAuthJWT = require('google-oauth-jwt');

//client auth helper
module.exports = function(params) {
  if (params.username) {
    if(!params.username || !params.password || !params.done) return;

    var googleAuth = new GoogleClientLogin({
      email: params.username,
      password: params.password,
      service: 'spreadsheets',
      accountType: GoogleClientLogin.accountTypes.google
    });
    //error - show and exit
    googleAuth.on(GoogleClientLogin.events.error, function(e) {
      params.done("Google Auth Error: " + e.message);
    });
    //success - next step
    googleAuth.on(GoogleClientLogin.events.login, function() {
      params.done(null, {type : 'GoogleLogin', token :  googleAuth.getAuthId()});
    });
    googleAuth.login();
  } else {
      
    GoogleOAuthJWT.authenticate({
        email: params.email,
        keyFile: params.keyFile,
        key: params.key,
        expiration : params.expiration,
        scopes: params.scopes,
        delegationEmail: params.delegationEmail,
        debug : params.debug
      }, function (err, token) {
        params.done(null, {type : 'Bearer', token :  token});
      });
  };
};