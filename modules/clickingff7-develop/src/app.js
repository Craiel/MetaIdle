'use strict';

/**
 * App module
 * @type {object}
 */
var app = angular.module('clickingff7', ['ngRoute', 'ngCookies', 'pascalprecht.translate']);

/**
 * Game Service
 */
app.factory('Game', ['$rootScope', '$cookieStore', '$http', '$timeout', '$translate',
    function ($rootScope, $cookieStore, $http, $timeout, $translate) {
        return new Game($rootScope, $cookieStore, $http, $timeout, $translate);
    }]);

/**
 * Routes logic
 */
app.config(['$routeProvider', '$translateProvider',
    function ($routeProvider, $translateProvider) {

        $translateProvider.useStaticFilesLoader({
            prefix: 'languages/',
            suffix: '.json'
        });

        $translateProvider.determinePreferredLanguage();

        $routeProvider.
            when('/game', {
                templateUrl: 'partials/game.html',
                controller : 'GameCtrl'
            }).
            when('/map', {
                templateUrl: 'partials/map.html',
                controller : 'MapCtrl'
            }).
            when('/shop', {
                templateUrl: 'partials/shop.html',
                controller : 'ShopCtrl'
            }).
            when('/items', {
                templateUrl: 'partials/items.html',
                controller : 'ItemsCtrl'
            }).
            when('/equip', {
                templateUrl: 'partials/equip.html',
                controller : 'EquipCtrl'
            }).
            when('/materia', {
                templateUrl: 'partials/materia.html',
                controller : 'MateriaCtrl'
            }).
            when('/config', {
                templateUrl: 'partials/config.html',
                controller : 'ConfigCtrl'
            }).
            when('/phs', {
                templateUrl: 'partials/phs.html',
                controller : 'PHSCtrl'
            }).
            when('/save', {
                templateUrl: 'partials/save.html',
                controller : 'SaveCtrl'
            }).
            otherwise({
                redirectTo: '/game'
            });
    }
]);

app.filter('time', function () {
    return function (elapsed) {
        var hours = Math.floor(elapsed / 3600);
        elapsed -= hours * 3600;

        var minutes = Math.floor(elapsed / 60);
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        var seconds = elapsed - minutes * 60;
        if (seconds < 10) {
            seconds = '0' + seconds;
        }

        return hours + ':' + minutes + ':' + seconds;
    };
});

/**
 * INDEX
 */

app.controller('IndexCtrl', function ($scope, $location, $http, Game) {

    $scope.gameFn = function () {
        return Game.mode;
    };

    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.isChannel = function (host) {
        return $location.host() === host;
    };

    /**
     * Go to the game
     */
    $scope.goGame = function () {
        $location.path("/game");
    };

    /**
     * Go to the map
     */
    $scope.goMap = function () {
        if (!Game.battle.isBattle) {
            $location.path("/map");
        }
    };

    /**
     * Go to the shop
     */
    $scope.goShop = function () {
        if (!Game.battle.isBattle) {
            $location.path("/shop");
        }
    };

    /**
     * Go to the items
     */
    $scope.goItems = function () {
        if (!Game.battle.isBattle) {
            $location.path("/items");
        }
    };

    /**
     * Go to the weapons
     */
    $scope.goEquip = function () {
        if (!Game.battle.isBattle) {
            $location.path("/equip");
        }
    };

    /**
     * Go to the materias
     */
    $scope.goMateria = function () {
        if (!Game.battle.isBattle) {
            $location.path("/materia");
        }
    };

    /**
     * Go to the game configuration
     */
    $scope.goConfig = function (ev) {
        if (!Game.battle.isBattle) {
            $location.path("/config");
        }
    };

    /**
     * Go to the PHS
     */
    $scope.goPHS = function (ev) {
        if (!Game.battle.isBattle && Game.zones.levelMax >= 5) {
            $location.path("/phs");
        }
    };

    /**
     * Save the game
     */
    $scope.goSave = function (ev) {
        if (!Game.battle.isBattle) {
            $location.path("/save");
        }
    };

    // Show help
    $scope.help = function (ev) {
        if (!Game.battle.isBattle) {
            $location.path("/game");

            $http({method: 'GET', url: 'help/' + Game.language + '.json'}).
                success(function (data, status, headers, config) {
                    var intro = introJs();
                    intro.setOptions(data);
                    intro.start();
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        }
    };

});

/**
 * /Game
 */

app.controller('GameCtrl', function ($rootScope, Game) {

    /**
     * Explore for fight
     */
    $rootScope.fightRandom = function (ev) {
        if (!Game.battle.isBattle) {
            Game.battle.startRandom();
        }
    };

    /**
     * Explore for fight
     */
    $rootScope.fightBoss = function (ev) {
        if (Game.battle.canFightBoss()) {
            Game.battle.startBoss();
        }
    };

    /**
     * Attack manually enemy
     */
    $rootScope.attack = function (ev) {
        if (Game.characters.canAttack()) {
            var pwr = Game.characters.getHits();
            Game.enemies.getAttacked(new Attack(pwr), false);
        }
    };

    /**
     * Escape fight
     */
    $rootScope.escape = function (ev) {
        if (Game.characters.canEscape()) {
            Game.characters.escape();
        }
    };

});

/**
 * /Map
 */

app.controller('MapCtrl', function ($location, Game) {
    // Redirection
    if (!Game.loaded) {
        $location.path('/game');
    }
});

/**
 * /Shop
 */

app.controller('ShopCtrl', function ($scope, $location, Game) {

    // Redirection
    if (!Game.loaded) {
        $location.path('/game');
    }

    $scope.changeSection = function (s) {
        Game.shop.section = s;
    };

    $scope.changeType = function (t) {
        Game.shop.type = t;
    };

});

/**
 * /Items
 */

app.controller('ItemsCtrl', function ($location, Game) {
    // Redirection
    if (!Game.loaded) {
        $location.path('/game');
    }
});

/**
 * /Weapons
 */

app.controller('EquipCtrl', function ($location, Game) {
    // Redirection
    if (!Game.loaded) {
        $location.path('/game');
    }
});

/**
 * /Materias
 */

app.controller('MateriaCtrl', function ($location, Game) {
    // Redirection
    if (!Game.loaded) {
        $location.path('/game');
    }
});

/**
 * /Config
 */

app.controller('ConfigCtrl', function ($scope, $rootScope, $translate, $location, Game) {

    // Redirection
    if (!Game.loaded) {
        $location.path('/game');
    }

    $scope.changeLanguage = function () {
        var language = $('#language').val();
        Game.language = language;
        $translate.use(language);
    };

    $scope.changeDifficulty = function () {
        var difficulty = $('#difficulty').val();
        Game.difficulty = difficulty;
    };

});

/**
 * /PHS
 */

app.controller('PHSCtrl', function ($location, Game) {

    // Redirection
    if (!Game.loaded || Game.zones.levelMax < 5) {
        $location.path('/game');
    }

});

/**
 * /Save
 */

app.controller('SaveCtrl', function ($scope, $rootScope, $location, Game) {

    // Redirection
    if (!Game.loaded) {
        $location.path('/game');
    }

    /**
     * Save the game
     */
    $rootScope.saveGame = function (ev) {
        Game.save();
    };

    /**
     * Reset the game
     */
    $rootScope.resetGame = function (ev) {
        if (Game.saves[0] && confirm('Are you sure ? You\'ll lose everything !')) {
            Game.preload();
            Game.reset();
            Game.buildLevel(1);
            Game.postload();
            $location.path('/game');
        }
    };

    /**
     * Export the current save
     */
    $rootScope.exportLastSave = function (ev) {
        var s;
        if (s = Game.saves[0]) {
            $('#area-import').hide();
            $('#area-export').show();
            $scope.areaExport = btoa(JSON.stringify(s));
        }
    };

    /**
     * Export the current game
     */
    $rootScope.exportCurrentGame = function (ev) {
        $scope.areaExport = btoa(JSON.stringify(Game.export()));
        $('#area-import').hide();
        $('#area-export').show();
    };

    /**
     * Show import area
     */
    $rootScope.showImport = function (ev) {
        $('#area-export').hide();
        $('#area-import').show();
    };

    /**
     * Import a save
     */
    $rootScope.importSave = function (ev) {
        if ($scope.areaImport && confirm('Are you sure ? You\'ll lose your current save !')) {
            var save = JSON.parse(atob($scope.areaImport));
            Game.preload();
            Game.load(save);
            Game.postload();
            $location.path('/game');
        }
    };

});