var GoogleOAuthJWT = require("google-oauth-jwt");
var GoogleAuth = require("google-auth-library");
var googleAuth = new GoogleAuth();

//client auth helper
module.exports = function(opts, callback) {
  if (opts.username && opts.password) callback("Client login not supported");
  else if (opts.oauth) oAuth1Login(opts.oauth, opts.useHTTPS, callback);
  else if (opts.oauth2) oAuth2Login(opts.oauth2, callback);
  else if (opts.accessToken) accessTokenLogin(opts.accessToken, callback);
};

function oAuth1Login(oauth, useHTTPS, callback) {
  if (!oauth.scopes) {
    oauth.scopes = ["http" + useHTTPS + "://spreadsheets.google.com/feeds"];
  }
  GoogleOAuthJWT.authenticate(oauth, function(err, token) {
    if (err) callback("Google OAuth Error: " + err);
    else callback(null, {type: "Bearer", token: token});
  });
}

function oAuth2Login(oauth2, callback) {
  var oAuth2Client = new googleAuth.OAuth2(
    oauth2.client_id,
    oauth2.client_secret,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  oAuth2Client.setCredentials({
    access_token: "DUMMY",
    expiry_date: 1,
    refresh_token: oauth2.refresh_token,
    token_type: "Bearer"
  });
  oAuth2Client.getAccessToken(function(err, token) {
    if (err) callback("Google OAuth2 Error: " + err);
    else callback(null, {type: "Bearer", token: token});
  });
}

function accessTokenLogin(accessToken, callback) {
  function gotToken(err, t) {
    if (err) return callback(err);
    if (!t.type || !t.token)
      return callback("Missing token or token type information");
    //got token
    callback(null, {type: t.type, token: t.token});
  }
  //
  if (typeof accessToken === "function") accessToken(gotToken);
  else if (typeof accessToken === "object") gotToken(null, accessToken);
  else callback("Invalid access token");
}
