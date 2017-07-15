'use strict';

var BasicHttpAuthExample = angular.module('BasicHttpAuthExample',['ngRoute','ngCookies']);

BasicHttpAuthExample.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', {
            controller: 'LoginController',
            templateUrl: 'login.html'
        })

        .when('/home', {
            controller: 'HomeController',
            templateUrl: 'home.html'
        })

        .otherwise({ redirectTo: '/login' });
}]);

BasicHttpAuthExample.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');   
            }
        });
    }]);

BasicHttpAuthExample.factory('AuthenticationService',
    ['$http', '$cookieStore', '$rootScope', '$timeout',
    function ($http,$cookieStore, $rootScope, $timeout) {
        var service = {};
        service.Login = function (username, password, callback) {
                var response = {success: username === 'nimesh.aug11@gmail.com' && password === 'password' };
                  $timeout(function(){ 
                 if(!response.success) {
                    response.message = 'Username or password is incorrect';
                    callback(response);
                }
                
             }, 1000);

                 if(response.success) 
                   $http.post('http://ec2-54-69-219-242.us-west-2.compute.amazonaws.com:8000/v1/customer/login/',{email:username,password:password})
                   .success(function (response) {
                    var ab = JSON.stringify(response.data);
                    callback({success:true},ab);     
               })
                   .error(function(data, status, headers, config) {
                    alert( "failure message: " + JSON.stringify({data: data}));
        });     
                 

        };

         service.SetCredentials = function (username,password,obj) {
            $rootScope.globals = {
                currentUser: {
                     username: username,
                     password: password   
                 },
                 data:obj
                
             };              
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
        };

        service.data=false; 
        service.sendData = function(data) {
                    this.data = data;
        };

        service.getData = function(){
                        return this.data;
                        };


        return service;
    }]);


BasicHttpAuthExample.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
        // reset login status
         AuthenticationService.ClearCredentials();  
        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function (response,data) {
                if (response.success) {
                    var obj = JSON.parse(data);
                    AuthenticationService.sendData(obj);
                    AuthenticationService.SetCredentials($scope.username, $scope.password,obj);
                    $location.path('/home');
                     }
                     else 
                     {
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }

            });
        };
        
     }]);


BasicHttpAuthExample.controller('HomeController',
    ['$scope','$rootScope','$cookieStore','AuthenticationService', 
    function ($scope,$rootScope,$cookieStore,AuthenticationService) {
                 var text = AuthenticationService.getData();
                         $scope.sandeep = $cookieStore.get('globals');
                        $scope.username = $scope.sandeep.data.username;
                        $scope.bio   = $scope.sandeep.data.bio;
                        $scope.image = $scope.sandeep.data.pic;
                        $scope.email = $scope.sandeep.data.email;

    }]);



