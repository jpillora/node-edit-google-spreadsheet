var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var GoogleOAuthJWT = require('google-oauth-jwt');

//client auth helper
module.exports = function(opts, done) {
  if(opts.username && opts.password)
    clientLogin(opts.username, opts.password, done);
  else if(opts.oauth)
    oauthLogin(opts.oauth, opts.useHTTPS, done);
  else if(opts.accessToken)
    accessTokenLogin(opts.accessToken.type, opts.accessToken.token, done);
};

function clientLogin(username, password, done) {
  var googleAuth = new GoogleClientLogin({
    email: username,
    password: password,
    service: 'spreadsheets',
    accountType: GoogleClientLogin.accountTypes.google
  });
  //error - show and exit
  googleAuth.on(GoogleClientLogin.events.error, function(e) {
    done("Google Client Login Error: " + e.message);
  });
  //success - next step
  googleAuth.on(GoogleClientLogin.events.login, function() {
    done(null, {type : 'GoogleLogin', token :  googleAuth.getAuthId()});
  });
  googleAuth.login();
}

function oauthLogin(oauth, useHTTPS, done) {

  if(!oauth.scopes)
    oauth.scopes = ['http'+useHTTPS+'://spreadsheets.google.com/feeds'];

  GoogleOAuthJWT.authenticate(oauth, function (err, token) {
    if(err)
      done("Google OAuth Error: " + err);
    else
      done(null, {type : 'Bearer', token :  token});
  });
}

function accessTokenLogin(type, token, done) {
  if(!type || !token)
    done("Missing token or token type information");

  done(null, {type : type, token : token});
}