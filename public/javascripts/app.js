/**
 * Created by Michael on 6/15/2014.
 */
'use strict';

var skipnodeApp = angular.module('skipnodeApp', [
   'ngRoute',
    'skipnodeControllers'
]);

skipnodeApp.config([
   '$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: '/views/loginView'
            })
            .when('/signup', {

            })
    }
]);