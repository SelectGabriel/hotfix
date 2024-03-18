angularjs.factory('translationFactory', function() {
  var translations = {
    'APPROVED': 'Aprovado',
    'REJECTED': 'Rejeitado'
  };

  return {
    translate: function(key) {
      return translations[key];
    }
  };
});
