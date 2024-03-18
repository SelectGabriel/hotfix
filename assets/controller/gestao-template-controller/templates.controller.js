angularjs.controller('templates', ['$scope', 'objectService', 'sunshineService', 'translationFactory',

  function($scope, objectService, sunshineService, translationFactory) {

    var client = ZAFClient.init()

    var customObjects
    const objectType = 'via_whatsapp_template_groups'

    // $scope.createTemplateDisabled = !$scope.newTemplate?.category;
    $scope.createTemplateDisabled = false;
    $scope.selectedTemplate = {};

    $scope.onAppIconClick = function(app) {
      $scope.appSelected = app;
      sortTable()
      console.log(app);
      if (app.id) {
        sunshineService.getTemplatesByIntegrationNumber(app.id, $scope.configuracoesGerais.suncoAppId).then(function(response) {
          console.log(response);
          response.messageTemplates.map(temp => temp.status = translationFactory.translate(temp.status));
          $scope.templates = response.messageTemplates;
          $scope.next = response.next ? response.next : null;
          $scope.previous = response.previous ? response.previous : null;

          objectService.getAllObjects(objectType).then(function(response) {
            customObjects = response.data;
            // updateScopeTemplate()
          }).catch(error => {
            client.invoke('notify', 'Erro ao carregar grupos', 'error', 20000)

          })
        }).catch(error => {
          $scope.templates = [];
          client.invoke('notify', 'Erro ao carregar template', 'error', 20000)
        })
      }
    };

    $scope.togglePage = function() {
      if ($scope.next) {
        let nextPage = `?next=${$scope.next}`;
        sunshineService.getTemplatesByIntegrationNumber($scope.appSelected.id, $scope.configuracoesGerais.suncoAppId, nextPage).then(res => {
          res.messageTemplates.map(temp => temp.status = translationFactory.translate(temp.status));
          $scope.templates = res.messageTemplates;
          $scope.next = res.next ? res.next : null;
          $scope.previous = res.previous ? res.previous : null;
        }).catch(error => client.invoke('notify', 'Houve um erro ao buscar a próxima página.', 'error', 10000));
      }

      if ($scope.previous) {
        let previousPage = `?previous=${$scope.previoue}`;
        sunshineService.getTemplatesByIntegrationNumber($scope.appSelected.id, $scope.configuracoesGerais.suncoAppId, previousPage).then(res => {
          res.messageTemplates.map(temp => temp.status = translationFactory.translate(temp.status));
          $scope.templates = res.messageTemplates;
          $scope.next = res.next ? res.next : null;
          $scope.previous = res.previous ? res.previous : null;
        }).catch(error => client.invoke('notify', 'Houve um erro ao buscar a próxima página.', 'error', 10000));
      }
    }

    $scope.getBodyComponentText = function(template) {
      let bodyComponent = template.components.find(component => component.type === 'BODY');
      return bodyComponent ? bodyComponent.text : '';
    };

    function sortTable() {
      $scope.sortKey = 'name'
      $scope.orderByField = function(column) {
        $scope.sortKey = column
        $scope.reverseSort = !$scope.reverseSort
      }
    }

    function pagination() {
      $scope.currentPage = 0;
      $scope.pageSize = 18;
      $scope.pageCount = function() {
        return (Math.ceil($scope.groups.length / $scope.pageSize))
      }
    }

    $scope.templateDetails = function(template) {
      let bodyComponent = template.components.find(component => component.type === 'BODY');
      let footerComponent = template.components.find(component => component.type === 'FOOTER');
      let headerComponent = template.components.find(component => component.type === 'HEADER');
      let buttonsComponent = template.components.find(component => component.type === 'BUTTONS');
      template.body = bodyComponent ? bodyComponent.text : '';
      template.footer = footerComponent ? footerComponent.text : '';
      template.header = headerComponent ? headerComponent.format : '';
      template.buttons = buttonsComponent ? buttonsComponent.buttons : [{ type: 'None' }];
      $scope.selectedTemplate = template;
      $("#templateDetails").modal("show");
    }

    $scope.confirmDelete = function(template) {
      console.log(template);
      $scope.selectedTemplate = template;
      $("#confirmModal").modal("show");
    };

    $scope.deleteTemplate = function() {
      sunshineService.deleteTemplate($scope.selectedTemplate.name, $scope.appSelected.id, $scope.configuracoesGerais.suncoAppId).then(function(response) {
        client.invoke('notify', 'Template excluído com sucesso', '', 20000);
      }, function(error) {
        console.error('Erro ao carregar os templates:', error);
        client.invoke('notify', 'Erro ao excluir o template, provavelmente para este template já foi solicitado a exclusão', 'error', 20000)
      });
      // Feche a modal de confirmação
      $("#confirmModal").modal("hide");
    };

    $scope.onButtonsChange = function() {
      if ($scope.newTemplate.buttons === 'Quick Reply') {
        $scope.newTemplate.quickReplies = [];
        $scope.addQuickReplyButton();
      } else if ($scope.newTemplate.buttons === 'Call to Action') {
        $scope.newTemplate.callToAction = {}
      } else {
        delete $scope.newTemplate.quickReplies;
        delete $scope.newTemplate.callToAction;
      }
    };

    $scope.onCalltoactionChange = function() {
      if ($scope.newTemplate.callToAction.type === 'PHONE_NUMBER') {
        delete $scope.newTemplate.callToAction.url
      } else {
        delete $scope.newTemplate.callToAction.phoneNumber
      }
    }

    $scope.onHeaderChange = function() {
      if ($scope.newTemplate.header === 'None') {
        delete $scope.newTemplate.headerSampleUrl;
        delete $scope.newTemplate.headerText;
      } else if ($scope.newTemplate.header === 'Image' || $scope.newTemplate.header === 'Document') {
        delete $scope.newTemplate.headerText;
      } else {
        delete $scope.newTemplate.headerSampleUrl;
      }
    };

    $scope.addQuickReplyButton = function() {
      if (!$scope.newTemplate.quickReplies) {
        $scope.newTemplate.quickReplies = [];
      }
      if ($scope.newTemplate.quickReplies.length < 3) {
        $scope.newTemplate.quickReplies.push({ type: $scope.newTemplate.buttons.replace(' ', '_').toUpperCase() });
      }
    };

    $scope.removeQuickReplyButton = function() {
      if ($scope.newTemplate.quickReplies.length > 1) {
        $scope.newTemplate.quickReplies.pop();
      }
    }

    $scope.openCreateTemplateModal = function() {
      $("#createTemplateModal").modal("show");
    };

    // $scope.newTemplate.body = '';
    $scope.uniqueMatches = [];
    // $scope.newTemplate.examples = [];
    $scope.newTemplate = {
      examples: []
    }

    $scope.onTextChange = function() {
      console.log($scope.uniqueMatches);
      console.log($scope.newTemplate.examples);
      const matches = $scope.newTemplate.body.match(/{{\d+}}/g);
      const newUniqueMatches = matches ? Array.from(new Set(matches)) : [];

      if ($scope.uniqueMatches.length > newUniqueMatches.length) {
        $scope.newTemplate.examples = $scope.newTemplate.examples.slice(0, newUniqueMatches.length);
      }

      $scope.uniqueMatches = newUniqueMatches;
    }

    $scope.createTemplate = function() {
      client.invoke('notify', 'Enviando os dados, por favor aguarde...', 'notice', 3000);
      console.log($scope.newTemplate);
      console.log(Object.values($scope.newTemplate.examples).map(value => value.split(' ')));

      if (!$scope.newTemplate?.category) {
        client.invoke('notify', 'Favor escolher uma categoria', 'error', 10000);
        return;
      }

      if (!$scope.newTemplate?.name) {
        client.invoke('notify', 'Favor preencher o nome do template', 'error', 10000);
        return;
      }

      if (!$scope.newTemplate?.body) {
        client.invoke('notify', 'Favor preencher o corpo da mensagem', 'error', 10000);
        return;
      }

      $scope.createTemplateDisabled = true;

      var header
      var footer

      var dataNewTemplate = {
        "category": $scope.newTemplate.category,
        "components": [
          {
            "type": "BODY",
            "text": $scope.newTemplate.body,
          }
        ],
        "name": $scope.newTemplate.name,
        "language": "pt_BR"
      }

      if ($scope.newTemplate.examples.length) {
        dataNewTemplate.components[0].example = {
          body_text: [$scope.newTemplate.examples]
        }
      }

      if ($scope.newTemplate.header === 'Image' || $scope.newTemplate.header === 'Document') {
        header = {
          "type": "HEADER",
          "format": $scope.newTemplate.header.toUpperCase(),
          "example": {
            "header_url": [$scope.newTemplate.headerSampleUrl]
          }
        }
        dataNewTemplate.components.unshift(header)
      } else if ($scope.newTemplate.header === 'Text') {
        header = {
          "type": "HEADER",
          "format": $scope.newTemplate.header.toUpperCase(),
          "text": $scope.newTemplate.headerText
        }
        dataNewTemplate.components.unshift(header)
      }

      if ($scope.newTemplate.footer !== undefined) {
        footer = {
          "type": "FOOTER",
          "text": $scope.newTemplate.footer
        }
        dataNewTemplate.components.push(footer)
      }

      if ($scope.newTemplate.buttons === 'Quick Reply') dataNewTemplate.components.push({ type: "BUTTONS", buttons: $scope.newTemplate.quickReplies })

      if ($scope.newTemplate.buttons === 'Call to Action' && $scope.newTemplate.callToAction.type === 'PHONE_NUMBER') dataNewTemplate.components.push({ type: "BUTTONS", buttons: [$scope.newTemplate.callToAction] })

      if ($scope.newTemplate.buttons === 'Call to Action' && $scope.newTemplate.callToAction.type === 'URL') dataNewTemplate.components.push({ type: "BUTTONS", buttons: [$scope.newTemplate.callToAction] })

      console.log(dataNewTemplate);

      sunshineService.createTemplate(dataNewTemplate, $scope.appSelected.id, $scope.configuracoesGerais.suncoAppId).then(function(data) {
        console.log(data);
        client.invoke('notify', 'Template criado com sucesso, aguarde a aprovação da Meta', '', 20000);
        $scope.createTemplateDisabled = false;
        $("#createTemplateModal").modal("hide");
      }).catch(error => {
        console.error(error);
        client.invoke('notify', 'Erro ao criar o template. Favor entrar em contato com o suporte.', 'error', 15000);
        $scope.createTemplateDisabled = false;
      });
    }
  }
]);

angularjs.filter('startFrom', function() {
  return function(input, start) {
    if (input) {
      start = +start;
      return input.slice(start);
    }
    return [];
  }
});
