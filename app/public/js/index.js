/**
Contains all logic for the web app which is not much. Not worth having separate files at this point.
*/
'use strict'
angular
    .module('CurrencyApp', [])
    .controller('MainController', ['$scope', 'ApiService', function ($scope, ApiService) {
        $scope.currencyBaseList = []
        $scope.currencyToList = []

        init()

        /** EXPOSED METHODS **/
        $scope.fetchRates = fetchRates
        $scope.updateResult = updateResult

        /** METHODS **/

        function init() {
            ApiService.fetchCurrencies()
                .success(function(response) {
                    console.log('fetchCurrencies', response)
                    $scope.currencyBaseList = Object.keys(response.rates)
                    if ($scope.currencyBaseList.includes('EUR')) { // pre-select EUR if available since is the only one with free license
                        $scope.currencyBaseSelected = 'EUR'
                    } else {
                        $scope.currencyBaseSelected = Object.assign([], $scope.currencyBaseList).pop() // extract any currency to start with
                    }

                    fetchRates()
                })
                .catch(console.error)

        }

        function fetchRates() {
            ApiService.fetchRates($scope.currencyBaseSelected)
                .success(function(response) {
                    $scope.errorMsg = undefined
                    console.log('fetchRates', response)
                    $scope.rates = response.rates
                    $scope.currencyToList = Object.keys($scope.rates)
                }).catch(function(e) {
                    console.error(e)
                    $scope.resultAmount = undefined
                    $scope.errorMsg = e.data
                })
        }

        function updateResult() {
            var rate = $scope.rates[$scope.currencyToSelected]
            $scope.resultAmount = $scope.currencyAmount * rate
        }
    }])
    .factory('ApiService', ['$http', function ($http) {
        var service = this



        /* METHODS */

        service.fetchCurrencies = function() {
            var url = '/api/currency?base=' + 'EUR'
            return $http.get(url)
        }

        service.fetchRates = function(currency) {
            var url = '/api/currency?base=' + currency
            return $http.get(url)
        }

        return service;
    }])
