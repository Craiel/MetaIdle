declare('GameModuleGC', function () {
    include('GameModule');

    GameModuleGC.prototype = gameModule.prototype();
    GameModuleGC.prototype.$super = parent;
    GameModuleGC.prototype.constructor = GameModuleGC;

    function GameModuleGC(id) {
        gameModule.construct(this, id);

        this.path = 'gc';
        this.title = 'Goomy Clicker';
    }

    // ---------------------------------------------------------------------------
    // basic functions
    // ---------------------------------------------------------------------------
    GameModuleGC.prototype.gameModuleInit = GameModuleGC.prototype.init;
    GameModuleGC.prototype.init = function(game) {
        this.gameModuleInit();

        // Init the module with the core game instance
    };

    GameModuleGC.prototype.gameModuleUpdate = GameModuleGC.prototype.update;
    GameModuleGC.prototype.update = function(gameTime) {
        if(this.gameModuleUpdate(gameTime) !== true) {
            return false;
        }


        return true;
    };

    // ---------------------------------------------------------------------------
    // module functions
    // ---------------------------------------------------------------------------

    var surrogate = function(){};
    surrogate.prototype = GameModuleGC.prototype;

    return {
        prototype: function() { return new surrogate(); },
        construct: function(self) { GameModuleGC.call(self); },
        create: function() { return new GameModuleGC('GoomyClicker'); }
    }

});