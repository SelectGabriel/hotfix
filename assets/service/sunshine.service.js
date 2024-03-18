(function() {
  'use strict';

  angularjs.service('sunshineService', ["$q", function($q) {

    var client = ZAFClient.init();

    return {

      getIntegrationNumbers: function(suncoAppId) {
        var deferred = $q.defer();
        var options = {
          url: 'https://app.smooch.io/v2/apps/' + suncoAppId + '/integrations',
          type: "GET",
          headers: {
            Authorization: "Basic {{setting.suncoEncodedAccessToken}}"
          },
          accepts: "application/json",
          secure: true
        }
        client.request(options).then(function(data) {
          var whatsappIntegrations = data.integrations.filter(function(integration) {
            return integration.type === 'whatsapp';
          });
          deferred.resolve(whatsappIntegrations);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      getTemplatesByIntegrationNumber: function(integrationId, suncoAppId, page = '') {
        var deferred = $q.defer();
        var options = {
          url: 'https://app.smooch.io/v1.1/apps/' + suncoAppId + '/integrations/' + integrationId + '/messageTemplates' + page,
          type: "GET",
          headers: {
            Authorization: "Basic {{setting.suncoEncodedAccessToken}}"
          },
          accepts: "application/json",
          secure: true
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      createTemplate: function(data, integrationId, suncoAppId) {
        var deferred = $q.defer();

        var options = {
          url: 'https://app.smooch.io/v1.1/apps/' + suncoAppId + '/integrations/' + integrationId + '/messageTemplates',
          type: "POST",
          "headers": {
            "Authorization": "Basic {{setting.suncoEncodedAccessToken}}",
            "content-type": "application/json"
          },
          accepts: "application/json",
          secure: true,
          data: JSON.stringify(data)
        };

        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });

        return deferred.promise;
      },

      deleteTemplate: function(name, integrationId, suncoAppId) {
        var deferred = $q.defer();

        var options = {
          url: 'https://app.smooch.io/v1.1/apps/' + suncoAppId + '/integrations/' + integrationId + '/messageTemplates/' + name,
          type: "DELETE",
          "headers": {
            "Authorization": "Basic {{setting.suncoEncodedAccessToken}}",
          },
          accepts: "application/json",
          secure: true,
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      postNotification: function(body, suncoAppId) {
        var deferred = $q.defer();

        var options = {
          url: `https://app.smooch.io/v1.1/apps/${suncoAppId}/notifications`,
          type: 'POST',
          headers: {
            "Authorization": "Basic {{setting.suncoEncodedAccessToken}}",
            "content-type": "application/json"
          },
          accepts: "application/json",
          secure: true,
          data: JSON.stringify(body)
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error)
        });
        return deferred.promise;
      }

    }
  }])

})();
