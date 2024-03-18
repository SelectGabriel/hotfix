angularjs.controller('logs', ['$scope', 'zendeskService', 'objectService', 'translationFactory',

  function($scope, zendeskService, objectService, translationFactory) {

    var client = ZAFClient.init()

    $scope.logs = [];
    $scope.disparos = [];

    $scope.filterLogs = function() {
      const startDate = formatDate($scope.startDate);
      const endDate = formatDate($scope.endDate);
      console.log(startDate, endDate);
      const data = {
        query: {
          _type: { $eq: 'acao_whatsapp' }
        },
        _created_at: {
          start: `${startDate} 00:00:00.000`,
          end: `${endDate} 23:59:59.999`
        }
      };
      objectService.searchLogs(data).then(res => {
        console.log(res);
        $scope.logs = res.data;
      }).catch(err => {
        console.log(err);
        client.invoke('notify', 'Houve um erro ao buscar os logs. Favor entrar em contato com o suporte.', 'error', 15000);
      });
    }

    $scope.showDisparo = function(acaoId) {
      objectService.listRelatedObjectRecords(acaoId, 'disparo_whatsapp').then(res => {
        console.log(res);
        $scope.disparos = res.data;
        $('#showDisparoModal').modal('show');
      }).catch(err => {
        console.error(err);
        client.invoke('notify', 'Erro ao buscar os logs de disparo', 'error', 15000);
      });
    }

    $scope.formatDateToLocal = function(date) {
      const dateUtc = new Date(date); const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const localDate = dateUtc.toLocaleDateString(undefined, options); // `undefined` defaults to the system's locale
      const localTime = dateUtc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `${localDate} ${localTime}`;
    }

    function formatDate(dateObj) {
      let year = dateObj.getFullYear();
      let month = ("0" + (dateObj.getMonth() + 1)).slice(-2); // Month is 0-based
      let day = ("0" + dateObj.getDate()).slice(-2);

      // Formatting the date to desired format
      return `${year}-${month}-${day}`;
    }

  }
]);

