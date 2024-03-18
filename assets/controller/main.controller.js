angularjs.controller('angularjs', ['$scope', 'zendeskService', 'sunshineService', 'objectService',

  function($scope, zendeskService, sunshineService, objectService) {

    const client = ZAFClient.init()
    const objectTypes = [
      'via_whatsapp_template_groups',
      'disparo_whatsapp',
      'acao_whatsapp'
    ]
    $scope.isUserSidebar = false;
    $scope.roleIsPermitted = false
    $scope.isTemplatesPermitted = false;
    $scope.isDisparoPermitted = false;
    $scope.isLogsPermitted = false;
    $scope.templates = []
    $scope.integrationNumbers = []

    this.$onInit = function() {
      client.metadata().then(function(metadata) {
        client.get('currentUser').then(({ currentUser }) => {
          $scope.currentUser = currentUser;
          $scope.isTemplatesPermitted = currentUser.groups.some(item => item.id == metadata.settings.groupTemplatesId);
          $scope.isDisparoPermitted = currentUser.groups.some(item => item.id == metadata.settings.groupDisparoId);
          $scope.isLogsPermitted = currentUser.groups.some(item => item.id == metadata.settings.groupLogsId);
          $scope.activeTab = $scope.isTemplatesPermitted ? 1 : ($scope.isDisparoPermitted ? 2 : 3);
          client.context().then(res => {
            console.log(res);
            if (res.location === 'user_sidebar') {
              $scope.isUserSidebar = true;
              $scope.activeTab = 2;
              return;
            }
          })
        });
        $scope.configuracoesGerais = {
          suncoAppId: metadata.settings.suncoAppId
        }
        setTimeout(() => {
          if ($scope.configuracoesGerais.suncoAppId !== null && $scope.configuracoesGerais.suncoAppId !== undefined) {
            loadIntegrationNumbers($scope.configuracoesGerais.suncoAppId)
          } else {
            client.invoke('notify', 'Erro ao carregar integrações, favor entrar em contato com o suporte.', 'alert', 20000)
          }
          checkObjectType(objectTypes);
        }, 1000)
      });
    }

    function loadIntegrationNumbers(appId) {
      console.log(appId);
      sunshineService.getIntegrationNumbers(appId).then(function(response) {
        console.log(response);
        $scope.integrationNumbers = response;
      }, function(error) {
        client.invoke('notify', 'Erro ao carregar integrações', 'error', 20000)
      })
    }

    function checkObjectType(objectTypes) {
      objectTypes.forEach(element => {
        objectService.showLegacyObjectType(element).then(() => {
          getObjects(element)
        }, function(error) {
          if (error.status === 404) {
            createObjectType(element)
          } else {
            client.invoke('notify', 'erro ao buscar dados no banco', 'error', 10000)
          }
        })
      });
      checkRelationshipType('disparo_whatsapp');
    }

    function checkRelationshipType(relType) {
      objectService.showLegacyRelationshipType(relType).then(() => {
      }, function(error) {
        if (error.status === 404) {
          const relationshipObj = {
            key: relType,
            source: 'acao_whatsapp',
            target: ['disparo_whatsapp']
          }
          createRelationshipType(relationshipObj);
        } else {
          client.invoke('notify', 'erro ao buscar dados no banco', 'error', 10000)
        }
      });
    }

    function getObjects(customObjType) {
      objectService.getAllObjects(customObjType).then(response => {
        $scope.customObjects = response.data
      }).catch(error => {
        console.log(error)
        client.invoke('notify', 'Ocorreu um erro, tente novamente mais tarde', 'error', 20000)
      })
    }

    function createObjectType(objectType) {
      let objectData;
      switch (objectType) {
        case 'via_whatsapp_template_groups':
          objectData = {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            }
          }
          break;

        case 'disparo_whatsapp':
          objectData = {
            nome: {
              type: 'string'
            },
            telefone: {
              type: 'string'
            }
          };
          break;

        case 'acao_whatsapp':
          objectData = {
            usuario: {
              type: 'string'
            },
            action: {
              type: 'string'
            },
            template: {
              type: 'string'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            numberOfClients: {
              type: 'integer'
            }
          };
          break;

        default:
          break;
      }
      objectService.createObjectType(objectType, objectData).then(() => {
      }).catch(e => {
        client.invoke('notify', 'erro ao criar objeto, favor contactar o suporte.', 'error', 10000)
      })
    }

    function createRelationshipType({ key, source, target }) {
      const data = {
        data: {
          key: key,
          source: source,
          target: target
        }
      };
      console.log(data);

      objectService.createRelationshipType(data).then(() => {

      }).catch(e => {
        client.invoke('notify', 'erro ao criar relacionamento, favor contactar o suporte.', 'error', 10000)
      });
    }

    $scope.setActiveTab = function(tab) {
      $scope.activeTab = tab
    };
  }
]);
