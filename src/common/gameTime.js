declare("GameTime", function() {
    include("Assert");
    
    var timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

    function GameTime() {
    	this.start = undefined;
    	this.current = undefined;
    	this.currentLocale = undefined;
    	this.elapsed = undefined;
    };

    // ---------------------------------------------------------------------------
    // game time functions
    // ---------------------------------------------------------------------------
    GameTime.prototype.update = function() {
        this.current = Date.now();
        this.currentLocale = this.current - timeZoneOffset;
        this.elapsed = this.current - this.start;

        assert.isTrue(this.current >= this.start, StrLoc("GameTime may not be initialized properly!"));
    };

    GameTime.prototype.reset = function() {
        this.start = Date.now();
        this.update();
    };

    GameTime.prototype.getTime = function(useLocalTime) {
        if (useLocalTime === true) {
            return this.currentLocale;
        }

        return this.current;
    };

    GameTime.prototype.getElapsed = function() {
        return this.elapsed;
    };

    GameTime.prototype.getElapsedSinceUpdate = function() {
        return Date.now() - this.current;
    };

    GameTime.prototype.getStartTime = function() {
        return this.start;
    };
    
    return {
        getCurrentLocalTime: function() { return Date.now() - timeZoneOffset; },
        create: function() {
        	// We make sure game time is always initialized
        	var time = new GameTime();
        	time.reset();
        	return time; 
        }
    };
});
