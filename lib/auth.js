var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var GoogleOAuthJWT = require('google-oauth-jwt');
var googleAuth = require('google-auth-library');
var GoogleOAuthClient = new googleAuth().OAuth2;

//client auth helper
module.exports = function(opts, done) {
  if(opts.username && opts.password)
    clientLogin(opts.username, opts.password, done);
  else if(opts.oauth)
    oauthLogin(opts.oauth, opts.useHTTPS, done);
  else if(opts.oauth2)
    oAuth2Login(opts.oauth2, done);
  else if(opts.accessToken)
    accessTokenLogin(opts.accessToken, done);
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
    done(null, {type : 'GoogleLogin', token :  'auth=' + googleAuth.getAuthId()});
  });
  googleAuth.login();
}

function oauthLogin(oauth, useHTTPS, done) {

  if(!oauth.scopes) {
    oauth.scopes = ['http'+useHTTPS+'://spreadsheets.google.com/feeds'];
  }

  GoogleOAuthJWT.authenticate(oauth, function (err, token) {
    if(err)
      done("Google OAuth Error: " + err);
    else
      done(null, {type : 'Bearer', token :  token});
  });
}

function oAuth2Login(oauth2, done ) {

  var oAuth2Client = new GoogleOAuthClient(oauth2.client_id, oauth2.client_secret, 'urn:ietf:wg:oauth:2.0:oob');

  oAuth2Client.setCredentials({
    access_token: 'DUMMY',
    expiry_date: 1,
    refresh_token: oauth2.refresh_token,
    token_type: 'Bearer'
  });
  oAuth2Client.getAccessToken(function(err, token) {
    if (err)
      done('Google OAuth2 Error: ' + err);
    else
      done(null, {type: 'Bearer', token: token });
  });
}

function accessTokenLogin(accessToken, done) {
  function gotToken(err, t) {
    if(err) return done(err);
    if(!t.type || !t.token)
      done("Missing token or token type information");
    //got token
    done(null, {type : t.type, token : t.token});
  }
  //
  if(typeof accessToken === 'function')
    accessToken(gotToken);
  else if(typeof accessToken === 'object')
    gotToken(null, accessToken);
  else
    done("Invalid access token");
}
