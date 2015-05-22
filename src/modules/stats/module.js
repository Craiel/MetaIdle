declare('GameModuleStats', function () {
    include('GameModule');

    GameModuleStats.prototype = gameModule.prototype();
    GameModuleStats.prototype.$super = parent;
    GameModuleStats.prototype.constructor = GameModuleStats;

    function GameModuleStats(id) {
        gameModule.construct(this, id);

        this.path = 'stats';
        this.title = 'Stats';
    }

    // ---------------------------------------------------------------------------
    // basic functions
    // ---------------------------------------------------------------------------
    GameModuleStats.prototype.gameModuleInit = GameModuleStats.prototype.init;
    GameModuleStats.prototype.init = function(game) {
        this.gameModuleInit();

        // Init the module with the core game instance
    };

    GameModuleStats.prototype.gameModuleUpdate = GameModuleStats.prototype.update;
    GameModuleStats.prototype.update = function(gameTime) {
        if(this.gameModuleUpdate(gameTime) !== true) {
            return false;
        }


        return true;
    };

    // ---------------------------------------------------------------------------
    // module functions
    // ---------------------------------------------------------------------------

    var surrogate = function(){};
    surrogate.prototype = GameModuleStats.prototype;

    return {
        prototype: function() { return new surrogate(); },
        construct: function(self) { GameModuleStats.call(self); },
        create: function(id) { return new GameModuleStats(id); }
    }

});