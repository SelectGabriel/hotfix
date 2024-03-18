angularjs.directive('validFile', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attrs, ctrl) {
            ctrl.$setValidity('validFile', el.val() != '')
            el.bind('change', function () {
                var file = el[0].files[0]

                if (!file || file.type !== 'text/csv') {
                    ctrl.$setValidity('validFile', false)
                    scope.$apply()
                } else {
                    var config = {
                        header: true,
                        skipEmptyLines: true,
                        complete: function (results) {
                            var lines = results.data

                            if (lines.length > 100) {
                                ctrl.$setValidity('csvLength', false)
                            } else {
                                ctrl.$setValidity('csvLength', true)
                            }
                            scope.$apply()
                        }
                    }

                    Papa.parse(file, config)

                    ctrl.$setValidity('validFile', el.val() != '')
                    scope.$apply(function () {
                        ctrl.$setViewValue(el.val())
                        ctrl.$render()
                    })
                }
            })
        }
    }
})