declare("Component", function() {
    include("Assert");
    
    if(MetaIdle.isDebug === true) {
        idCheck = {};
    }
    
    function Component() {
        this.initDone = false;
        this.updateTime = undefined;
        this.updateInterval = 0;
        
        this.enabled = true;
        this.invalidated = true;
        this.updateWhenNeededOnly = false;
    }

    // ---------------------------------------------------------------------------
    // main functions
    // ---------------------------------------------------------------------------
    Component.prototype.init = function() {
        assert.isDefined(this.id, StrLoc("Component needs valid Id"));

        if(MetaIdle.isDebug === true) {
            assert.isUndefined(idCheck[this.id], StrLoc("Duplicate ID: {0}").format(this.id));
            idCheck[this.id] = true;
        }

        MetaIdle.componentInitCount++;

        this.initDone = true;
    };

    Component.prototype.update = function(currentTime) {
        assert.isTrue(this.initDone, StrLoc("Init must be called before update on {0}").format(this.id));

        if(this.enabled === false) {
            return false;
        }

        // If we don't need an update and we are only allowed to update then bail out
        if(this.invalidated === false && this.updateWhenNeededOnly === true) {
            return false;
        }

        // If we don't need an update and we are updating in intervals and our interval is not yet up, bail out
        if(this.invalidated === false && this.updateInterval > 0 && currentTime.getElapsed() < this.updateInterval) {
            return false;
        }

        MetaIdle.componentUpdateList.push(this.id);
        MetaIdle.componentUpdateCount++;

        this.updateTime = currentTime.getTime();
        this.invalidated = false;
        return true;
    };

    Component.prototype.remove = function() {
        if(MetaIdle.isDebug) {
            delete idCheck[this.id];
        }
    };

    Component.prototype.invalidate = function() {
        this.invalidated = true;
    };

    var surrogate = function(){};
    surrogate.prototype = Component.prototype;

    return {
        prototype: function() { return new surrogate(); },
        construct: function(self) { Component.call(self); }
    };
    
});