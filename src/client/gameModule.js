declare('GameModule', function () {
    include('Component');

    GameModule.prototype = component.prototype();
    GameModule.prototype.$super = parent;
    GameModule.prototype.constructor = GameModule;

    function GameModule(id) {
        component.construct(this);

        this.id = "GameModule" + id;
        this.path = undefined;
        this.title = undefined;
    }

    // ---------------------------------------------------------------------------
    // basic functions
    // ---------------------------------------------------------------------------
    GameModule.prototype.componentInit = GameModule.prototype.init;
    GameModule.prototype.init = function(game) {
        this.componentInit();

        // Init the module with the core game instance
    };

    GameModule.prototype.componentUpdate = GameModule.prototype.update;
    GameModule.prototype.update = function(gameTime) {
        if(this.componentUpdate(gameTime) !== true) {
            return false;
        }


        return true;
    };

    // ---------------------------------------------------------------------------
    // module functions
    // ---------------------------------------------------------------------------

    var surrogate = function(){};
    surrogate.prototype = GameModule.prototype;

    return {
        prototype: function() { return new surrogate(); },
        construct: function(self, id) { GameModule.call(self, id); },
        create: function(id) { return new GameModule(id); }
    }

});