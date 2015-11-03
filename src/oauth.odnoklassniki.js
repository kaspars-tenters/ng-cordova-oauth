angular.module('oauth.odnoklassniki', ['oauth.utils'])
  .factory('$odnoklassniki', odnoklassniki);

function odnoklassniki($q, $http, $cordovaOauthUtility) {
  return { signin: oauthOdnoklassniki };

  /*
   * Sign into the Odnoklassniki service
   *
   * @param    string clientId
   * @param    array appScope (for example: "VALUABLE_ACCESS ,GROUP_CONTENT,VIDEO_CONTENT")
   * @param  string windowOpenOptions (additional options to pass to window.open such as allowInlineMediaPlayback=yes,enableViewportScale=no)
   * @return   promise
   */
  function oauthOdnoklassniki(clientId, appScope, windowOpenOptions) {
    var deferred = $q.defer();
    if (window.cordova) {
      var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
      if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
          var browserRef = $cordovaOauthUtility.windowOpenProxy('http://www.odnoklassniki.ru/oauth/authorize?client_id=' + clientId + '&scope=' + appScope.join(",") + '&response_type=token&redirect_uri=http://localhost/callback' + '&layout=m', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes', windowOpenOptions);
          browserRef.addEventListener('loadstart', function (event) {
            if ((event.url).indexOf("http://localhost/callback") === 0) {
              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = [];
              for (var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }
              if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve({ access_token: parameterMap.access_token, session_secret_key: parameterMap.session_secret_key });
              } else {
                deferred.reject("Problem authenticating");
              }
              setTimeout(function () {
                browserRef.close();
              }, 10);
            }
          });
          browserRef.addEventListener('exit', function (event) {
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

odnoklassniki.$inject = ['$q', '$http', '$cordovaOauthUtility'];
