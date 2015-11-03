angular.module('oauth.imgur', ['oauth.utils'])
  .factory('$imgur', imgur);

function imgur($q, $http, $cordovaOauthUtility) {
  return { signin: oauthImgur };

  /*
   * Sign into the Imgur service
   *
   * @param    string clientId
   * @param    object options
   * @param  string windowOpenOptions (additional options to pass to window.open such as allowInlineMediaPlayback=yes,enableViewportScale=no)
   * @return   promise
   */
  function oauthImgur(clientId, options, windowOpenOptions) {
    var deferred = $q.defer();
    if(window.cordova) {
      var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
      if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = $cordovaOauthUtility.windowOpenProxy('https://api.imgur.com/oauth2/authorize?client_id=' + clientId + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes', windowOpenOptions);
        browserRef.addEventListener('loadstart', function(event) {
          if((event.url).indexOf(redirect_uri) === 0) {
            browserRef.removeEventListener("exit",function(event){});
            browserRef.close();
            var callbackResponse = (event.url).split("#")[1];
            var responseParameters = (callbackResponse).split("&");
            var parameterMap = [];
            for(var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in, account_username: parameterMap.account_username });
            } else {
              deferred.reject("Problem authenticating");
            }
          }
        });
        browserRef.addEventListener('exit', function(event) {
          deferred.reject("The sign in flow was canceled");
        });
      } else {
        deferred.reject("Could not find InAppBrowser plugin");
      }
    } else {
      deferred.reject("Cannot authenticate via a web browser");
    }

    return deferred.promise;
  }
}

imgur.$inject = ['$q', '$http', '$cordovaOauthUtility'];
