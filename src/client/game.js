declare('Game', function() {
    include('Log');
    include('Component');
    include('Save');
    include('SaveKeys');
    include('StaticData');
    include('EventAggregate');
    include('GameModuleGC');
    include('GameModuleStats');

    pendingMessageEvents = [];
    eventAggregate.subscribe(staticData.EventNetworkMessage, function(args) { pendingMessageEvents.push(args); });

    Game.prototype = component.prototype();
    Game.prototype.$super = parent;
    Game.prototype.constructor = Game;

    function Game() {
        this.id = "Game";

        this.modules = {};
    }

    // ---------------------------------------------------------------------------
    // basic functions
    // ---------------------------------------------------------------------------
    Game.prototype.componentInit = Game.prototype.init;
    Game.prototype.init = function () {
        this.componentInit();

        var module = gameModuleStats.create();
        module.init(this);
        this.modules[module.id] = module;

        var module = gameModuleGC.create();
        module.init(this);
        this.modules[module.id] = module;

        this.load();
    };

    Game.prototype.componentUpdate = Game.prototype.update;
    Game.prototype.update = function (gameTime) {
        if (this.componentUpdate(gameTime) !== true) {
            return false;
        }

        this.currentTime = gameTime.current;

        // Update the modules
        for(var key in this.modules) {
            this.modules[key].update(gameTime);
        }

        return true;
    };

    // ---------------------------------------------------------------------------
    // game functions
    // ---------------------------------------------------------------------------
    Game.prototype.getModules = function() {
        return this.modules;
    };

    // ---------------------------------------------------------------------------
    // save / load functions
    // ---------------------------------------------------------------------------
    Game.prototype.save = function() {
        save.save();
    };

    Game.prototype.load = function() {
        save.load();
    };

    Game.prototype.reset = function() {
        save.reset();
    };

    Game.prototype.onLoad = function() {
        // Perform some initial operation after being loaded
    };

    return new Game();
});