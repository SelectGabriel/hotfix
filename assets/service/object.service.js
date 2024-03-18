(function() {
  'use strict';

  angularjs.service('objectService', ["$q", function($q) {

    var client = ZAFClient.init();

    return {

      showLegacyObjectType: function(objectType = '') {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/objects/types/' + objectType,
          headers: {
            "Content-Type": "application/json",
          },
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      showLegacyRelationshipType: function(relType = '') {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/relationships/types/' + relType,
          headers: {
            "Content-Type": "application/json",
          },
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      createObjectType: function(objectType, objectData) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/objects/types',
          type: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            "data": {
              "key": objectType,
              "schema": {
                "properties": objectData
              }
            }
          })
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      createRelationshipType: function(data) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/relationships/types',
          type: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data)
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      createObject: function(objectType, objectData) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/objects/records',
          type: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            "data": {
              "type": objectType,
              "attributes": objectData
            }
          })
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      createRelationship: function(data) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/relationships/records',
          type: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data)
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      updateObject: function(objId, objectData) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/objects/records/' + objId,
          type: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
          },
          data: JSON.stringify({
            "data": {
              "attributes": objectData
            }
          })
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      searchLogs: function(data) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/objects/query?per_page=50',
          type: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data)
        };
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      getObjRecord: function(externalId, customObjType) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/objects/records?external_ids=' + externalId + '&type=' + customObjType,
          type: 'GET',
          headers: {
            "Content-Type": "application/json"
          }
        }
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error)
        })
        return deferred.promise;
      },

      getAllObjects: function(customObjType) {
        var deferred = $q.defer();
        var options = {
          url: '/api/sunshine/objects/records?type=' + customObjType,
          type: 'GET',
          headers: {
            "Content-Type": "application/json"
          }
        }
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error)
        })
        return deferred.promise;
      },

      listRelatedObjectRecords: function(acaoId, relType) {
        var deferred = $q.defer();
        var options = {
          url: `/api/sunshine/objects/records/${acaoId}/related/${relType}`,
          type: 'GET',
          headers: {
            "Content-Type": "application/json"
          }
        }
        client.request(options).then(function(data) {
          deferred.resolve(data);
        }).catch(function(error) {
          deferred.reject(error)
        })
        return deferred.promise;
      },

    }
  }])

})();
