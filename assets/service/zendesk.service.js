(function() {
  'use strict';

  angularjs.service('zendeskService', ["$q", function($q) {

    var client = ZAFClient.init();

    return {

      getOAuthToken: function(clientId) {
        var deferred = $q.defer();
        var options = {
          url: '/api/v2/oauth/tokens',
          type: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            "token": {
              "client_id": clientId,
              "scopes": ["read", "write"]
            }
          })
        };
        client.request(options).then(function(data) {
          deferred.resolve(data.token);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      searchUserByPhone: function(phone) {
        var deferred = $q.defer();
        var options = {
          url: '/api/v2/users/search?query=' + phone,
          type: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      getUser: function(userId) {
        var deferred = $q.defer();
        var options = {
          url: `/api/v2/users/${userId}`,
          type: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      getTags: function() {
        var deferred = $q.defer();
        var options = {
          url: '/api/v2/tags',
          type: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      searchUsersByTag: function(tags, includeOptOut) {
        var deferred = $q.defer();
        var query = '';
        console.log(tags.length);
        if (tags.length && includeOptOut) {
          query = `?query=tags:${tags}`;
        } else if (tags.length && !includeOptOut) {
          query = `?query=tags:${tags} -tags:opt_out`
        } else if (!tags.length && !includeOptOut) {
          query = `?query=-tags:opt_out`;
        }
        console.log(...tags);
        console.log(includeOptOut);
        console.log(query);
        var options = {
          url: `/api/v2/users/search${query}`,
          type: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        };

        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      searchUsers: function(url) {
        console.log(url);
        var deferred = $q.defer();
        var options = {
          url: url,
          type: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

    }
  }])

})();
