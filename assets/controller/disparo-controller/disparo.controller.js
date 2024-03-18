angularjs.controller('disparo', ['$scope', '$timeout', 'sunshineService', 'translationFactory', 'zendeskService', 'objectService',

  function($scope, $timeout, sunshineService, translationFactory, zendeskService, objectService) {

    var client = ZAFClient.init()
    var csvData = []
    var csvHeader
    var allTags;
    var tagsList = [];
    // $scope.tipoDisparo = null
    $scope.components = {}
    $scope.templates = [];
    $scope.tagsList = [];
    $scope.tagsResult = [];
    $scope.showTagsResult = false;
    $scope.clientsCount = 0;
    $scope.clientsList = [];
    $scope.includeOptOut = false;
    $scope.clientsNextPage = null;
    $scope.clientsPreviousPage = null;
    let currentUser;

    $scope.loadTemplatesByIntegrationNumber = function(appId) {
      sunshineService.getTemplatesByIntegrationNumber(appId, $scope.configuracoesGerais.suncoAppId).then((response) => {
        $scope.templates.push(...response.messageTemplates.filter(temp => temp.status === 'APPROVED'));
        if (response.next) {
          sunshineService.getTemplatesByIntegrationNumber(appId, $scope.configuracoesGerais.suncoAppId, `?next=${response.next}`).then(res => {
            $scope.templates.push(...res.messageTemplates.filter(temp => temp.status === 'APPROVED'));
          }).catch(error => {
            console.error(error);
            client.invoke('notify', 'Erro ao carregar template', 'error', 20000);
          });
        }
        console.log($scope.templates);
        // getTemplatesByGroups($scope.currentUser.groups, $scope.customObjects, response.messageTemplates)
      }).catch((error) => {
        $scope.templateText = ''
        console.error(error)
        client.invoke('notify', 'Erro ao carregar template', 'error', 20000)
      });
    }

    $scope.editComponents = function(template) {
      console.log(template);
      if (template !== undefined) {

        if ($scope.isUserSidebar) editUserSidebarComponents();

        $scope.templateText = getTemplateText(template)
        // checkDisparoRules($scope.regrasDisparo)
        $scope.regexArr = getComponentsLength($scope.templateText)
        if ($scope.regexArr) {
          csvHeaderMaker($scope.regexArr.length)
        } else {
          csvHeaderMaker()
        }
      } else {
        return $scope.tipoDisparo = null
      }
    }

    function editUserSidebarComponents() {
      $scope.tipoDisparo = 'individual';
      client.get('user').then(({ user }) => {
        zendeskService.getUser(user.id).then(({ user }) => {
          if (user.phone && user.phone !== '') validateUserphone(user.phone);
        }).catch(err => {
          console.error(err);
          client.invoke('notify', 'Houve um erro ao buscar o telefone do usuário', 'error', 10000);
        });
      })
    }

    function validateUserphone(phoneNumber) {
      phoneNumber = phoneNumber.replace(/\D/g, '');
      console.log(phoneNumber);

      if (phoneNumber.length > 11 && $scope.isUserSidebar) {
        phoneNumber = phoneNumber.slice(2);
      }

      if ($scope.isUserSidebar) {
        $scope.telefone = phoneNumber;
        return;
      }

      return phoneNumber
    }

    function getTemplateText(template) {
      var text
      template.components.forEach((element) => {
        if (element.type === "BODY") {
          text = element.text
        }
      })
      return text
    }

    $scope.fetchTags = function(searchText) {
      if (searchText.length > 0) {
        $scope.tagsResult = allTags.filter(tag => tag.name.includes(searchText));
      }
    }

    $scope.updateTagsList = function(tag) {
      tagsList.push(tag);
      $scope.tagsList = [...new Set(tagsList)];
    }

    $scope.removeTag = function(index) {
      $scope.tagsList.splice(index, 1);
      tagsList = $scope.tagsList;
    }

    $scope.onFocus = function() {
      if (!$scope.tagsResult.length) {
        zendeskService.getTags().then(({ tags }) => {
          console.log(tags);
          allTags = tags;
          $scope.tagsResult = tags;
          // $scope.tagsResult = tags.filter(tag => tag.name.includes(searchText));
          $scope.showTagsResult = true;
        }).catch(err => {
          console.error(err);
          client.invoke('notify', 'Erro ao buscar as tags de usuário', 'error', 10000);
        });
      }
    }

    $scope.hideTagsResult = function() {
      $timeout(function() {
        $scope.showTagsResult = false;
        $scope.tagsResult = [];
      }, 100);
    }

    $scope.searchUsersByTag = function() {
      console.log($scope.tagsList);
      zendeskService.searchUsersByTag($scope.tagsList, $scope.includeOptOut).then(res => {
        console.log(res);
        if (!res.users.length) {
          client.invoke('notify', 'Não há clientes com essa combinação de tags', 'error', 10000);
        }
        $scope.clientsList = res.users;
        $scope.clientsCount = res.count;

        $scope.clientsNextPage = res.next_page ? res.next_page : null;
        $scope.clientsPreviousPage = res.previous_page ? res.prevous_page : null;

      }).catch(err => {
        console.error(err);
        client.invoke('notify', 'Erro ao buscar os clientes', 'error', 15000);
      });
    }

    $scope.confirmClientsModal = function() {
      $('#confirmClientsModal').modal('show');
      console.log($scope.clientsList);
    }

    $scope.toggleClientsPage = function(page) {
      if (page === 'next') {
        const url = $scope.clientsNextPage.split('.com')[1];
        zendeskService.searchUsers(url).then(res => {
          $scope.clientsList = res.users;
          $scope.clientsNextPage = res.next_page ? res.next_page : null;
          $scope.clientsPreviousPage = res.previous_page ? res.previous_page : null;
        }).catch(error => client.invoke('notify', 'Houve um erro ao buscar a próxima página.', 'error', 10000));
      } else {
        const url = $scope.clientsPreviousPage.split('.com')[1];
        zendeskService.searchUsers(url).then(res => {
          $scope.clientsList = res.users;
          $scope.clientsNextPage = res.next_page ? res.next_page : null;
          $scope.clientsPreviousPage = res.previous_page ? res.previous_page : null;
        }).catch(error => client.invoke('notify', 'Houve um erro ao buscar a página anterior.', 'error', 10000));
      }

    }

    function getComponentsLength(str) {
      var regex = /\{{2}\d+\}{2}/g
      var found = str.match(regex)
      if (found) {
        return found
      } else {
        return
      }
    }

    function csvHeaderMaker(num) {
      var csvRows = ['telefone']
      if (num) {
        for (var i = 0; i < num; i++) {
          csvRows.push(`componente${i + 1}`)
        }
      }
      csvHeader = csvRows.join(',').concat('\n')
    }

    $scope.replaceStr = function(template, regexArr, components) {
      let text = getTemplateText(template)
      var keys = Object.keys(components)
      for (let i = 0; i < keys.length; i++) {
        if (components[keys[i]] !== undefined) {
          text = text.replace(regexArr[i], components[keys[i]])
        }
      }
      $scope.templateText = text
    }

    $scope.bodySubmit = function(tipoDisparo) {
      var bodyArr = []
      var body
      if (tipoDisparo === 'individual') {
        body = createBody($scope.components, `55${$scope.telefone}`)
        postIndividualNotification(body)
      } else if (tipoDisparo === 'planilha') {
        csvData.forEach(element => {
          body = createBody(element, element.telefone)
          bodyArr.unshift(body)
        })

        client.invoke('notify', 'O arquivo está sendo processado...', 20000);

        objectService.createObject('acao_whatsapp', {
          usuario: $scope.currentUser.name,
          action: 'Envio planilha',
          template: $scope.templateType.name,
          numberOfClients: bodyArr.length
        }).then(res => {
          postBulkNotification(bodyArr.length, bodyArr, res.data.id);
        }).catch(err => {
          console.error(err);
          client.invoke('notify', 'Erro ao guardar ação no banco de dados.', 'error', 15000);
        });

      } else {
        console.log($scope.components);
        let components = {};
        client.invoke('notify', 'O disparo está sendo processado...', 20000);
        $scope.clientsList.forEach(element => {
          Object.entries($scope.components).forEach(([key, value]) => {
            if (value.includes('[')) {
              console.log(element.name);
              const match = value.match(/\[(.*?)\]/);
              if (match[1].toLowerCase() === 'nome') {
                components[key] = element.name;
              } else if (match[1].toLowerCase() === 'whatsapp' || match[1].toLowerCase() === 'telefone') {
                components[key] = element.phone;
              } else {
                components.key = value;
              }
            } else {
              components[key] = value;
            }
          });
          console.log($scope.components);
          console.log(components);
          if (element.phone) {
            body = createBody(components, validateUserphone(element.phone));
            bodyArr.unshift(body);
          }
        });
        console.log(bodyArr);

        objectService.createObject('acao_whatsapp', {
          usuario: $scope.currentUser.name,
          action: 'Envio tags',
          template: $scope.templateType.name,
          tags: $scope.tagsList,
          numberOfClients: bodyArr.length
        }).then(res => {
          postBulkNotification(bodyArr.length, bodyArr, res.data.id);
        }).catch(err => {
          console.error(err);
          client.invoke('notify', 'Erro ao guardar ação no banco de dados.', 'error', 15000);
        });

        $('#confirmClientsModal').modal('hide');
      }
    }

    $scope.updateTelefone = function(telefone) {
      $scope.telefone = telefone
    }

    function createBody(obj, telefone) {
      console.log(obj);
      var body = {
        "destination": {
          "integrationId": $scope.integrationNumber,
          "destinationId": telefone
        },
        "author": {
          "role": "appMaker"
        },
        "messageSchema": "whatsapp",
        "message": {
          "type": "template",
          "template": {
            "namespace": "6ea28e95_c2ea_45c1_bfd0_41dd1078aaff",
            "name": $scope.templateType.name,
            "language": {
              "policy": "deterministic",
              "code": "pt_BR"
            }
          }
        }
      }

      var keys = Object.keys(obj)
      if (keys.length > 0) {
        var parameters = []
        var component = [{
          "type": "body",
          "parameters": parameters
        }]

        keys.forEach(key => {
          if (key !== "telefone") {
            var parameter = {
              "type": "text",
              "text": obj[key]
            }
            parameters.push(parameter)
          }
        })
        body.message.template.components = component
        return body
      } else {
        return body
      }
    }

    async function postIndividualNotification(payload) {
      try {
        await sunshineService.postNotification(payload, $scope.configuracoesGerais.suncoAppId);
        const acao = objectService.createObject('acao_whatsapp', {
          usuario: $scope.currentUser.name,
          action: 'Envio individual',
          template: $scope.templateType.name,
          numberOfClients: 1
        });

        const { users } = await zendeskService.searchUserByPhone(`55${$scope.telefone}`);
        let name;
        if (users.length) {
          name = users[0].name;
        }

        const disparo = objectService.createObject('disparo_whatsapp', {
          nome: name ? name : 'n/a',
          telefone: `55${$scope.telefone}`
        });

        const promises = await Promise.all([acao, disparo]);

        const data = {
          data: {
            relationship_type: 'disparo_whatsapp',
            source: promises[0].data.id,
            target: promises[1].data.id
          }
        };

        await objectService.createRelationship(data);

        client.invoke('notify', 'Disparo realizado', 15000);

      } catch (error) {
        console.error(error);
        client.invoke('notify', 'Ocorreu um erro no disparo individual, favor contactar o suporte', 'error', 15000);
      }
    }

    async function postBulkNotification(num, payload, idAcao) {
      if (num === 0) {
        client.invoke('notify', 'O arquivo foi carregado com sucesso', 20000);
      } else {
        try {
          console.log(payload[num - 1]);
          await sunshineService.postNotification(payload[num - 1], $scope.configuracoesGerais.suncoAppId);

          let name;

          const { users } = await zendeskService.searchUserByPhone(payload[num - 1].destination.destinationId);
          if (users.length) {
            name = users[0].name;
          }

          const disparo = await objectService.createObject('disparo_whatsapp', {
            nome: name ? name : 'n/a',
            telefone: payload[num - 1].destination.destinationId
          });

          const data = {
            data: {
              relationship_type: 'disparo_whatsapp',
              source: idAcao,
              target: disparo.data.id
            }
          };

          await objectService.createRelationship(data);

        } catch (error) {
          console.log(error);
        }
        return postBulkNotification(num - 1, payload, idAcao)
      }
    }

    $scope.getCsvData = function(event) {
      let csvFile = document.getElementById('uploadfile').files[0]
      if (!csvFile) return
      if (csvFile.type !== 'text/csv') {
        client.invoke('notify', 'O arquivo precisa ser do tipo CSV', 'error', 20000)
        document.getElementById('uploadfile').value = ''
      } else {
        Papa.parse(csvFile,
          {
            header: true,
            skipEmptyLines: true,
            complete: results => {
              validateCsv(results.data)
            }
          }
        )
      }
    }

    function validateCsv(csv) {
      if (csv.length > 100) {
        client.invoke('notify', 'Arquivo com limite de envios excedido (máximo 100).', 'error', 20000)
        document.getElementById('uploadfile').value = ''
        csvData = []
      } else {
        csvData = csv
        return csvData
      }
    }

    $scope.downloadTemplateCsvFile = function() {
      let filename = `${$scope.templateType.name}.csv`
      let file = new File([csvHeader], filename, { type: 'text/csv' })
      let a = document.createElement('a')
      a.href = URL.createObjectURL(file)
      a.download = filename
      a.click()
    }
  }
]);
