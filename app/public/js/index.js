/**
Contains all logic for the web app which is not much. Not worth having separate files at this point.
*/
'use strict'
angular
    .module('CurrencyApp', [])
    .controller('MainController', ['$scope', 'ApiService', function ($scope, ApiService) {
        $scope.currencyToList = []
        $scope.currencyBase = Object.assign([], ApiService.currencyBaseList).pop() // extract any currency to start with

        ApiService.fetchRates($scope.currencyBase)
            .success(function(response) {
                console.log(response)
                $scope.rates = response.rates
                $scope.currencyToList = Object.keys($scope.rates)
            })

        $scope.updateResult = function() {
            var rate = $scope.rates[$scope.currencyToSelected]
            $scope.resultAmount = $scope.currencyAmount * rate
        }
    }])
    .factory('ApiService', ['$http', function ($http) {
        var service = this

        service.currencyBaseList = ['EUR']; // TODO: fetch from server

        service.fetchRates = function(currency) {
            var url = '/api/currency?base=' + currency
            return $http.get(url)
        }

        return service;
    }])
