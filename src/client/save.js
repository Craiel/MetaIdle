declare('Save', function() {
    include('Log');
    include('CoreSave');
    
    Save.prototype = coreSave.prototype();
    Save.prototype.$super = parent;
    Save.prototype.constructor = Save;
    
    // ---------------------------------------------------------------------------
    // main save object
    // ---------------------------------------------------------------------------
    function Save() {
        coreSave.construct(this);

        this.stateName = "metaIdleSave";
    }

    // ---------------------------------------------------------------------------
    // main functions
    // ---------------------------------------------------------------------------
    Save.prototype.doSave = function(data) {
        var storageKey = this.getStorageKey();
        localStorage[storageKey] = data;
        return true;
    };

    Save.prototype.doLoad = function() {
        var storageKey = this.getStorageKey();
        return localStorage[storageKey];
    };

    Save.prototype.doGetSize = function() {
        var storageKey = this.getStorageKey();
        if(localStorage[storageKey] !== undefined) {
            return localStorage[storageKey].length;
        }

        return 0;
    };

    // ---------------------------------------------------------------------------
    // utility functions
    // ---------------------------------------------------------------------------
    Save.prototype.getLocalStorageSize = function() {
        var size = 3072; // General overhead for localstorage is around 3kb
        for(var entry in localStorage) {
            size += (entry.length + localStorage[entry].length) * 16;
        }

        return size;
    };

    Save.prototype.debugLocalStorage = function() {
        for(var entry in localStorage) {
            log.debug(entry + ": " + localStorage[entry].length);
        }
    };
    
    return new Save();
    
});
